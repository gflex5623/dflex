#!/bin/bash
set -e
pip install -r requirements.txt
npm --prefix client install
npm --prefix client run build
