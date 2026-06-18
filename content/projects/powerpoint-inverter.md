---
title: PowerPoint Inverter
description: A Python tool that inverts the colours of image-based PowerPoint slides, turning light worship-lyric decks into dark, projector-friendly versions while keeping text legible.
techStack:
  - Python
  - python-pptx
  - Pillow
order: 1
draft: false
---

A small command-line utility built to invert the colours of image-heavy
PowerPoint presentations. Many worship teams ship slides as flat images with a
metadata textbox below them, which makes a simple theme switch impossible. This
tool walks each slide, inverts the embedded images, and rewrites the textboxes
so the whole deck reads cleanly on a dark background.
