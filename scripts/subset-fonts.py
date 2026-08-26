"""
나눔명조 원본(.ttf)에서 실제로 쓰는 글자만 남겨 woff2로 변환합니다.

원본에는 한자 수천 자를 포함해 웹에서 쓰지 않는 글자가 대부분이라 파일 하나가 3MB입니다.
한글·라틴·문장부호만 남기고 woff2로 압축하면 10분의 1 수준(약 300~460KB)이 되고,
화면에 보이는 결과는 같습니다.

문구를 바꾸다가 한자나 특수문자를 새로 쓰게 되면 extra_characters()에 추가한 뒤
이 스크립트를 다시 실행하세요.

사용법:
    python scripts/subset-fonts.py

필요 패키지:
    python -m pip install fonttools brotli
"""

from pathlib import Path

from fontTools.subset import main as pyftsubset

FONTS_DIR = Path(__file__).resolve().parent.parent / "app" / "fonts"

SOURCES = [
    "NanumMyeongjo-Regular.ttf",
    "NanumMyeongjo-Bold.ttf",
    "NanumMyeongjo-ExtraBold.ttf",
]


def korean_syllables() -> list[str]:
    """한글 음절 11,172자 전체(U+AC00~U+D7A3).

    자주 쓰는 2,350자만 남기면 조금 더 줄지만, 드문 음절이 다른 글꼴로 튀어
    보이게 됩니다. 전체를 넣어도 한자를 뺀 것만으로 충분히 가벼워집니다.
    """
    return [chr(code) for code in range(0xAC00, 0xD7A4)]


def extra_characters() -> list[str]:
    """라틴 문자·숫자·문장부호 등 본문에 섞여 나오는 글자."""
    chars = [chr(code) for code in range(0x0020, 0x007F)]  # 기본 라틴
    chars += [chr(code) for code in range(0x3131, 0x318F)]  # 호환용 자모 (ㄱ, ㅏ 등)
    chars += list("　·—–…‘’“”「」『』〈〉《》→←↑↓°±×÷≤≥≠∼※©®™€₩£¥")
    return chars


def main() -> None:
    unicodes = korean_syllables() + extra_characters()
    unicode_arg = ",".join(f"U+{ord(char):04X}" for char in unicodes)
    print(f"남길 글자 수: {len(unicodes)}자")

    for source_name in SOURCES:
        source = FONTS_DIR / source_name
        if not source.exists():
            print(f"건너뜀 (원본 없음): {source_name}")
            continue

        output = FONTS_DIR / f"{source.stem}-subset.woff2"
        pyftsubset(
            [
                str(source),
                f"--unicodes={unicode_arg}",
                "--flavor=woff2",
                "--layout-features=kern,liga,calt",
                "--no-hinting",
                "--desubroutinize",
                f"--output-file={output}",
            ]
        )

        before_mb = source.stat().st_size / 1024 / 1024
        after_kb = output.stat().st_size / 1024
        print(f"{source_name}: {before_mb:.1f}MB -> {output.name} {after_kb:.0f}KB")


if __name__ == "__main__":
    main()
