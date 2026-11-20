#!/bin/bash

# Keycloak の起動直後（初期化中）はトークンエンドポイントが 503 とテキストを返すため、
# 接続失敗・5xx の間は再試行する。4xx（認証情報の誤りなど）は再試行しても解決しないため即座に終了する
TOKEN_MAX_ATTEMPTS=30
TOKEN_RETRY_INTERVAL_SECONDS=2

TOKEN=""
for ATTEMPT in $(seq 1 "${TOKEN_MAX_ATTEMPTS}"); do
    # 本文の後ろに改行と HTTP ステータスを付けて受け取る（接続失敗時のステータスは 000）
    RESPONSE=$(curl -s -w '\n%{http_code}' \
         -d "client_id=admin-cli" \
         -d "username=${TF_VAR_keycloak_admin}" \
         -d "password=${TF_VAR_keycloak_admin_password}" \
         -d "grant_type=password" \
         "${TF_VAR_keycloak_url}/realms/master/protocol/openid-connect/token")
    HTTP_CODE=$(tail -n 1 <<< "${RESPONSE}")
    BODY=$(sed '$d' <<< "${RESPONSE}")

    if [ "${HTTP_CODE}" = "200" ]; then
        if ! TOKEN=$(jq -er '.access_token' <<< "${BODY}"); then
            echo "Error: トークンエンドポイントの応答からアクセストークンを取り出せませんでした。"
            exit 1
        fi
        break
    fi

    if [[ "${HTTP_CODE}" =~ ^4[0-9]{2}$ ]]; then
        echo "Error: アクセストークンの取得に失敗しました (HTTP Status: ${HTTP_CODE})。認証情報を確認してください。"
        exit 1
    fi

    echo "Keycloak の準備ができていません (HTTP Status: ${HTTP_CODE})。${TOKEN_RETRY_INTERVAL_SECONDS}秒後に再試行します... (${ATTEMPT}/${TOKEN_MAX_ATTEMPTS})"
    sleep "${TOKEN_RETRY_INTERVAL_SECONDS}"
done

if [ -z "${TOKEN}" ]; then
    echo "Error: ${TOKEN_MAX_ATTEMPTS}回試行してもアクセストークンを取得できませんでした。Keycloak の状態を確認してください。"
    exit 1
fi

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer ${TOKEN}" \
    "${TF_VAR_keycloak_url}/admin/realms/${TF_VAR_keycloak_realm_name}")

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "Realm '${TF_VAR_keycloak_realm_name}' が見つかりました。削除を実行します..."
    
    DELETE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
        -H "Authorization: Bearer ${TOKEN}" \
        "${TF_VAR_keycloak_url}/admin/realms/${TF_VAR_keycloak_realm_name}")
    
    if [ "${DELETE_STATUS}" -eq 204 ]; then
        echo "削除に成功しました。"
    else
        echo "Error: 削除に失敗しました (HTTP Status: ${DELETE_STATUS})"
        exit 1
    fi
else
    echo "Realm '${TF_VAR_keycloak_realm_name}' は存在しません。削除をスキップします。"
fi

echo "terraformを用いてkeycloakの設定を行います。"
/usr/local/bin/terraform init && /usr/local/bin/terraform apply -auto-approve
