# Source & Provenance Offer — Tang AI Video Editor

This file accompanies release builds so recipients can identify the covered source and third-party source locations used for the distributed binaries.

## Tang AI Video Editor / SynthCut-derived application

- License: GNU GPL-3.0-or-later.
- Canonical public repository for this fork: `https://github.com/nguyenkhactang922-bot/SynthCut`.
- Every published binary release must identify the exact Git commit/tag used to build it and keep the corresponding fork source obtainable under the GPL terms.
- Upstream SynthCut provenance and notices remain preserved in the repository and `THIRD_PARTY_LICENSES.md`.

The build-time `aive/bundle-manifest.json` records the exact Git commit observed when the resources were staged.

## FFmpeg / ffprobe

The Windows release profile is pinned by `release/compliance/ffmpeg-windows.json`.

Pinned binary build:
- provider: gyan.dev / `GyanD/codexffmpeg`;
- version/build: `6.1.1-essentials_build-www.gyan.dev`;
- archive: `https://github.com/GyanD/codexffmpeg/releases/download/6.1.1/ffmpeg-6.1.1-essentials_build.7z`;
- pinned archive SHA-256: `9e1ddfab8eb16c30690eb769fab1301380139dd00026c8da5c667c7aad7e5cc9`;
- FFmpeg upstream tag: `n6.1.1`;
- upstream source archive: `https://github.com/FFmpeg/FFmpeg/archive/refs/tags/n6.1.1.tar.gz`;
- provider build information: `https://www.gyan.dev/ffmpeg/builds/`;
- Chocolatey package record: `https://community.chocolatey.org/packages/ffmpeg/6.1.1`.

The staged `ffmpeg.exe` and `ffprobe.exe` SHA-256 values are verified against the pin and repeated in `aive/bundle-manifest.json`. If either byte hash or version/provider banner differs, release staging must fail closed.

FFmpeg is distributed as a static GPL build. The release operator must keep the exact FFmpeg upstream source and the build/provider information above available with the release evidence and must not substitute an unpinned binary without reopening the provenance gate.

## whisper.cpp and bundled Whisper model

- whisper.cpp release: `v1.9.0`.
- source/release: `https://github.com/ggml-org/whisper.cpp/releases/tag/v1.9.0`.
- Windows x64 binary asset: `whisper-bin-x64.zip` from that release.
- bundled model: `ggml-base.en.bin`.
- model source: `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin`.
- license: MIT.

The build manifest hashes the exact staged executable, sibling runtime libraries, and model bytes.

## YuNet face detector

- model: `face_detection_yunet_2023mar.onnx`.
- source: `https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx`.
- license: Apache-2.0.

The build manifest hashes the exact staged model bytes.

## Noto Sans

- file: `NotoSans-Regular.ttf`.
- source: `https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf`.
- license text source: `https://raw.githubusercontent.com/googlefonts/noto-fonts/main/LICENSE`.
- license: SIL Open Font License 1.1.

The build manifest hashes both the staged font and staged license bytes.

## Other dependencies

See `THIRD_PARTY_LICENSES.md` for the complete dependency/license notice and the separate Remotion commercial-license gate. This source/provenance offer does not waive or replace any third-party license terms.
