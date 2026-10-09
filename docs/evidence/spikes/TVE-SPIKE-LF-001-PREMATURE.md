# TVE-SPIKE-LF-001 — Premature Run Observation

Status: PREMATURE / FAIL — RETAINED AS TECHNICAL EVIDENCE ONLY
Date: 2026-10-06
Baseline HEAD: `96b1ca0e8b9935cc0d9561a3bc020f29bf9e88a0`

## Why this is not a gate result
The LF spike was launched before the expanded canonical lifecycle was normalized and before DISCOVER/DEFINE/RESEARCH completeness was explicitly revalidated. It therefore cannot advance Freeze and must not be resumed until DESIGN re-authorizes the spike.

## What was nevertheless observed
A disposable local fixture was generated:
- 30:00 duration;
- 1920x1080;
- 30 fps;
- H.264 video + AAC audio.

The disposable project assembled ~301 clips, saved and loaded without data loss:
- assembled count: 301;
- saved project: ~6.12 ms;
- loaded project: ~5.81 ms;
- loaded count: 301;
- timeline duration: 1800 s.

## Failure
The first warm preview failed before render completion with Windows `ENAMETOOLONG`.

The generated FFmpeg command repeated the same 30-minute source as hundreds of `-i` inputs for 6-second slices, even though the segmented preview was attempting a local render window. The command grew beyond the Windows process-launch limit.

## Technical implication
This is not evidence that the SynthCut base must be replaced. It is evidence that long-form render command construction must be bounded by the current segment/window or otherwise avoid O(number-of-clips) repeated input arguments for local segment renders.

Potential DESIGN directions to prove in a later disposable POC include:
- filter the staged clip set to only clips intersecting the render window before building each segment command;
- deduplicate repeated media inputs when safe;
- use segment/intermediate/concat strategies that keep process arguments bounded;
- treat Windows command-size/path limits as an explicit long-form acceptance risk.

No production fix is authorized by this document.

## Disposition
The large `.spike-temp/lf001/` fixture/harness is disposable and should be removed after this observation is captured. A later re-authorized `TVE-SPIKE-LF-001` starts from this failure checkpoint conceptually but must use the corrected DESIGN hypothesis rather than blindly rerunning the same command path.
