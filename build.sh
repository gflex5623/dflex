#!/bin/bash
set -e
pip install -r backend/requirements.txt
npm --prefix client install
npm --prefix client run build
