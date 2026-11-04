"""지점별 시설 슬라이드 사진 준비.
~/Desktop/팀jj피트니스/<지점>/사진/(업체사진|방문자리뷰|소식) 의 파일을 정렬 순서 기준 태그(B01/R01/N01)로 고르고,
긴 변 1200px · q78 로 줄여 images/fac/<key>-<zone>-<nn>.jpg 로 저장한다.
기존 images/fac/<key>-<zone>.jpg(단일 대표 사진)는 각 존의 01번으로 들어간다.
"""
import glob, os, sys
from PIL import Image, ImageOps

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.expanduser('~/Desktop/팀jj피트니스')
OUT = os.path.join(ROOT, 'images', 'fac')
SUB = {'B': '업체사진', 'R': '방문자리뷰', 'N': '소식'}

PICKS = {
  ('okgye', '옥계점'): {
    'machine': ['OLD', 'R04', 'R07', 'R08', 'R09', 'R10', 'R19', 'R20', 'N06', 'N07'],
    'free':    ['OLD', 'R01', 'R02', 'R05', 'R06', 'R14', 'R15', 'R21', 'R22'],
    'cardio':  ['OLD', 'R18', 'R17'],
    'locker':  ['OLD'],
  },
  ('daegok', '대곡점'): {
    'machine': ['OLD', 'R01', 'R02', 'R05', 'R08', 'R09', 'R10', 'R11', 'R13', 'R33'],
    'free':    ['OLD', 'R04', 'R06', 'R17', 'R18', 'R19', 'R27', 'R29', 'R30'],
    'cardio':  ['OLD', 'R07', 'B03'],
    'locker':  ['OLD', 'R03', 'R21', 'R22', 'R23'],
  },
  ('hyeonggok', '형곡점'): {
    'machine': ['OLD', 'R02', 'R03', 'R08', 'R09', 'R10', 'R11', 'R13', 'R17', 'R29'],
    'free':    ['OLD', 'R07', 'R16', 'R18', 'R24', 'R27'],
    'cardio':  ['OLD', 'R21', 'R22'],
    'locker':  ['OLD', 'R04', 'R05', 'R15', 'R19', 'R25', 'R20'],
  },
  ('bonggok', '봉곡점'): {
    'machine': ['OLD', 'R04', 'R08', 'R12', 'R13', 'R14', 'R15', 'R19', 'R20', 'R29'],
    'free':    ['OLD', 'R17', 'R18', 'R34', 'R22', 'R23', 'R24'],
    'cardio':  ['OLD', 'R02', 'R09', 'R10', 'R16', 'R26', 'R31'],
    'locker':  [],
  },
}


def tag_file(br, tag):
    fs = sorted(f for f in glob.glob(os.path.join(SRC, br, '사진', SUB[tag[0]], '*'))
                if f.lower().endswith(('.jpg', '.jpeg', '.png')))
    return fs[int(tag[1:]) - 1]


def main():
    tmp = {}
    # 1) 기존 단일 사진을 먼저 읽어 둔다 (파일을 지우기 전에)
    for (k, br), zones in PICKS.items():
        for z in zones:
            old = os.path.join(OUT, f'{k}-{z}.jpg')
            if os.path.exists(old):
                tmp[(k, z)] = Image.open(old).convert('RGB').copy()
    # 2) 기존 슬라이드 파일 정리
    for f in glob.glob(os.path.join(OUT, '*-*-*.jpg')):
        os.remove(f)
    # 3) 생성
    for (k, br), zones in PICKS.items():
        for z, tags in zones.items():
            n = 0
            for t in tags:
                if t == 'OLD':
                    if (k, z) not in tmp:
                        continue
                    im = tmp[(k, z)]
                else:
                    im = ImageOps.exif_transpose(Image.open(tag_file(br, t))).convert('RGB')
                im.thumbnail((1200, 1200))
                n += 1
                im.save(os.path.join(OUT, f'{k}-{z}-{n:02d}.jpg'), quality=78, optimize=True)
            print(k, z, n)
    # 4) 기존 단일 파일 삭제
    for (k, br), zones in PICKS.items():
        for z in zones:
            old = os.path.join(OUT, f'{k}-{z}.jpg')
            if os.path.exists(old):
                os.remove(old)
    for f in glob.glob(os.path.join(OUT, '*-shower.jpg')):
        os.remove(f)


if __name__ == '__main__':
    main()
