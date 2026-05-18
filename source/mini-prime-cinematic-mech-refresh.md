# Mini Prime Cinematic Mech Refresh

Goal: refresh Mini Prime's spritesheet so the outline feels more detailed and cinematic while remaining a small readable Codex-style pet.

Do not copy any specific copyrighted robot design. Use the user reference only as a broad direction: heroic red-blue-silver cinematic truck-robot energy, noble posture, layered mechanical armor, and more refined silhouette.

Visual spec:

- Compact full-body desktop pet, readable inside a 192x208 cell.
- Red chest and shoulder armor, deep blue limbs, silver/steel faceplate and torso mechanics.
- More detailed silhouette than the current version: sharper segmented helmet, slim side fins, layered cheek/faceplate shapes, articulated shoulder blocks, beveled forearms, angular knee guards, boot-like feet, visible panel breaks.
- Keep proportions friendly and mini: large readable head, sturdy torso, short heroic limbs.
- Materials: matte painted metal with subtle bevels and clean highlights, not glossy photoreal.
- Mood: calm, powerful, noble, dependable.
- Avoid: logos, readable text, weapons, exact Optimus Prime movie-accurate helmet/chest shapes, flames, truck brand marks, faction marks, overly complex tiny details that disappear at 192x208.

Spritesheet requirements:

- Same atlas geometry as the current Mini Prime pet.
- 8 columns x 9 rows.
- Cell size: 192 x 208.
- States: idle, running-right, running-left, waving, jumping, failed, waiting, running, review.
- Preserve transparent background in final `spritesheet.webp`.
- Keep idle calm; the floating Claude version uses only idle frame 0 when resting.

Suggested generation prompt:

Create a Codex desktop pet spritesheet for `mini-prime`, a compact heroic red-blue-silver cinematic mech companion. The design should be more refined and detailed than a simple toy robot: sharper segmented helmet silhouette with slim side fins, layered silver faceplate, cyan eyes, red chest and shoulders, deep blue limbs, articulated shoulder blocks, beveled forearms, angular knee guards, boot-like feet, visible mechanical panel breaks, matte painted metal, subtle clean highlights. Keep it friendly, mini, noble, readable at 192x208, no logos, no readable text, no weapons, no faction symbols, and do not copy any exact movie robot design. Use a flat chroma-key background for extraction and maintain consistent identity across all animation states.
