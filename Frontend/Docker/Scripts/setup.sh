#!/bin/bash

# Git設定ファイルをコピー
cp -r /tmp/.ssh ~/.ssh
cp /tmp/.gitconfig ~/.gitconfig

# 所有者不一致による警告を非表示
git config --global --add safe.directory /var/www/civilios-portal