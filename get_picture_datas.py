import os
import json
import time
import requests
import contextlib
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# 构造请求头，模拟浏览器访问
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36"
}


# 设置程序运行的最大时间（秒）
MAX_EXE_TIMES = 5.5 * 3600  # 6小时

RETRIES = Retry(total=3,
                backoff_factor=1,
                status_forcelist=[k for k in range(400, 600)])


@contextlib.contextmanager
def request_session():
    s = requests.session()
    try:
        s.headers.update(HEADERS)
        s.mount("http://", HTTPAdapter(max_retries=RETRIES))
        s.mount("https://", HTTPAdapter(max_retries=RETRIES))
        yield s
    finally:
        s.close()


def start(mids):
    """
    开始执行
    """
    datas = []
    for mid in mids:
        get_dynamic_images(datas, mid)  # 获取 up 主的动态图片
    if datas:
        json_path = make_path(f'./raw/datas.json')
        if path_is_exist(json_path):
            with open(json_path, 'r', encoding='utf-8') as f:
                before_data = json.load(f)
                datas = merge_data(datas, before_data)
        write_json_file(datas, json_path)


def get_dynamic_images(datas, mid, next_offset=0):
    """
    获取某个 up 主的动态图片
    :datas 结果List
    :mids: up主的ID
    :next_offset: 偏移量
    """
    try:
        url = f'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid={mid}&offset_dynamic_id={next_offset}'
        # 发送 GET 请求，获取响应内容，并解析为 JSON 格式
        with request_session() as s:
            response = s.get(url).json()
            # 构造请求 URL，查询 up 主的动态
            data = response.get('data')
            if not data:
                return
            items = data.get('cards', [])  # 从响应内容中获取动态列表
            next_offset = data.get('next_offset')
            for item in items:  # 遍历动态列表
                item = json.loads(item.get('card')).get('item')
                if not item:
                    continue
                pictures = item.get('pictures')  # 获取当前动态中的图片列表
                if not pictures:  # 如果当前动态没有图片，跳过
                    continue
                for picture in pictures:  # 遍历图片列表
                    image_url = picture.get('img_src')  # 获取图片链接
                    if not image_url:  # 如果图片链接不存在，
                        continue
                    # 构造图片文件名，以图片链接中的最后一段为名称
                    filename = image_url.split('/')[-1]
                    datas.append({
                        'title': filename,
                        'src': image_url,
                        'author_id': mid
                    })
             # 检查是否超过了最大运行时间
            current_time = time.time()
            if current_time - start_time >= MAX_EXE_TIMES:
                return
            if next_offset:  # 如果偏移量存在
                get_dynamic_images(datas, mid, next_offset)
    except Exception as ex:
        print(ex)


def path_is_exist(path):
    '''
    文件或者文件夹是否存在
    '''
    return os.path.exists(path)


def make_path(path):
    '''
    路径生成模块
    '''
    paths = path.split('/')
    paths.remove('.')
    if len(paths) > 1 and not os.path.exists('/'.join(paths[:-1])):
        os.makedirs('/'.join(paths[:-1]))
    return path


def write_json_file(data, path):
    '''
    写入文件模块
    '''
    jsonstr = json.dumps(data, indent=4, ensure_ascii=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(jsonstr)


def merge_data(current_data, before_data):
    '''
    当前数据和通过的数据通过URL作为唯一标识进行merge
    param:current_data 当前数据
    param:before_data 过去的数据
    '''
    tmp_obj = {}
    if current_data and before_data:
        concat_data = current_data + before_data
        for data in concat_data:
            tmp_obj[data.get('src')] = data.copy()
        merge_datas = [tmp_obj.get(key) for key in tmp_obj]
        return merge_datas
    elif current_data:
        return current_data
    else:
        return before_data


if __name__ == '__main__':
    start_time = time.time()
    start(['13127564', '3493137785817215'])
