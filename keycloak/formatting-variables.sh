#!/bin/bash
# 都道府県とそれに対応する市町村のマップが記載されているjsonファイルを元に、
# その情報をPostman(newman) の環境変数ファイル(variables.json)に設定する。
existsFile() {
  if [ "$1" != "" ] && [ ! -f $1 ]; then
    echo エラー: ファイル $1 の確認に失敗しました。 >&2
    return 3
  fi
}

variablesFile=variables.json
prefectureFile=output.json
if [ "$1" != "" ]; then
    prefectureFile=$1
fi
cd -- $(dirname "$0")
existsFile $variablesFile && existsFile $prefectureFile || exit $?

cp $variablesFile $variablesFile.bak || exit $?

printFilter() {
    echo '{ "values" : (.values | from_entries | .+{"PrefectureList": ($prefectures | tostring)} | to_entries) }'
}

jq --unbuffered --slurpfile prefectures $prefectureFile -f <(printFilter) $variablesFile.bak > $variablesFile || exit $?
echo $variablesFileを更新しました。
