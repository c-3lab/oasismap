package com.github.c3lab.keycloak.userprofile.validator;

import jakarta.ws.rs.core.Response;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.keycloak.userprofile.AttributeContext;
import org.keycloak.userprofile.UserProfileAttributeValidationContext;
import org.keycloak.userprofile.UserProfileContext;
import org.keycloak.validate.SimpleValidator;
import org.keycloak.validate.ValidationContext;
import org.keycloak.validate.ValidationError;
import org.keycloak.validate.ValidatorConfig;

import java.util.Collection;
import java.util.Locale;
import java.util.Objects;

/**
 * ニックネーム属性をサーバー側で検証するユーザープロファイル Validator。
 *
 * <p>ニックネームは投稿の所有者判定と管理者のデータ分析に使うため、次の3点を保証する。</p>
 * <ol>
 *   <li>本人による変更の禁止: 既に値を持つユーザーが、管理者以外のコンテキスト（アカウントコンソール等）で値を変えられない</li>
 *   <li>登録時の username との一致: 登録画面（REGISTRATION）では、小文字化した username と同じ値でなければならない</li>
 *   <li>一意性: 自分以外のユーザーが同じ値を使っていない</li>
 * </ol>
 *
 * <p>空値の判定や文字種の判定は、realm のユーザープロファイル設定（required / pattern）に任せる。</p>
 */
public class NicknameValidator implements SimpleValidator {

    public static final String ID = "oasismap-nickname";

    // アカウントコンソールは標準テーマのためメッセージキーを解決できない。日本語の文言を直接返す
    static final String MESSAGE_DUPLICATED = "ニックネームは既に使用されています。別のニックネームを入力してください。";
    static final String MESSAGE_USERNAME_MISMATCH = "ニックネームはユーザー名と同じ値（英小文字）である必要があります。";
    static final String MESSAGE_IMMUTABLE = "ニックネームは変更できません。";

    private static final String USERNAME_ATTRIBUTE = "username";

    @Override
    public String getId() {
        return ID;
    }

    @Override
    public ValidationContext validate(Object input, String inputHint, ValidationContext context, ValidatorConfig config) {
        String nickname = firstValue(input);
        if (nickname == null || nickname.isBlank()) {
            return context;
        }

        if (!(context instanceof UserProfileAttributeValidationContext)) {
            throw new IllegalStateException(ID + " はユーザープロファイルの属性検証でのみ使用できます。context=" + context.getClass().getName());
        }

        AttributeContext attributeContext = ((UserProfileAttributeValidationContext) context).getAttributeContext();
        String attributeName = attributeContext.getMetadata().getName();
        UserModel user = attributeContext.getUser();
        UserProfileContext profileContext = attributeContext.getContext();
        KeycloakSession session = context.getSession();
        RealmModel realm = session.getContext().getRealm();

        if (isChangedBySelf(profileContext, user, attributeName, nickname)) {
            context.addError(new ValidationError(ID, inputHint, MESSAGE_IMMUTABLE)
                    .setStatusCode(Response.Status.BAD_REQUEST));
            return context;
        }

        if (profileContext == UserProfileContext.REGISTRATION
                && !matchesUsername(attributeContext.getAttributes().getFirst(USERNAME_ATTRIBUTE), nickname)) {
            context.addError(new ValidationError(ID, inputHint, MESSAGE_USERNAME_MISMATCH)
                    .setStatusCode(Response.Status.BAD_REQUEST));
            return context;
        }

        if (isUsedByOtherUser(session, realm, user, attributeName, nickname)) {
            context.addError(new ValidationError(ID, inputHint, MESSAGE_DUPLICATED)
                    .setStatusCode(Response.Status.CONFLICT));
        }

        return context;
    }

    /**
     * 入力値の先頭を取り出す。ユーザープロファイルからは値のリストが渡される。
     */
    private static String firstValue(Object input) {
        if (input == null) {
            return null;
        }
        if (input instanceof String) {
            return (String) input;
        }
        if (input instanceof Collection<?>) {
            return ((Collection<?>) input).stream()
                    .filter(Objects::nonNull)
                    .map(Object::toString)
                    .findFirst()
                    .orElse(null);
        }
        throw new IllegalArgumentException(ID + " が想定していない入力型です。type=" + input.getClass().getName());
    }

    /**
     * 管理者以外のコンテキストで、既存のニックネームを別の値に変えようとしているか。
     * 既存値が空のユーザー（IdP 初回ログインなど）は、初回の設定として許可する。
     */
    private static boolean isChangedBySelf(UserProfileContext profileContext, UserModel user, String attributeName, String nickname) {
        if (user == null || profileContext.isAdminContext()) {
            return false;
        }
        String current = user.getFirstAttribute(attributeName);
        return current != null && !current.isBlank() && !current.equals(nickname);
    }

    /**
     * Keycloak は username を小文字にして保存するため、小文字化した username と比較する。
     */
    private static boolean matchesUsername(String username, String nickname) {
        return username != null && nickname.equals(username.toLowerCase(Locale.ROOT));
    }

    /**
     * 自分以外に同じニックネームを持つユーザーがいるか。
     * 登録時・IdP 確認時の user は未保存（ID が null）なので、検索結果はすべて他人として扱われる。
     */
    private static boolean isUsedByOtherUser(KeycloakSession session, RealmModel realm, UserModel user, String attributeName, String nickname) {
        String selfId = user == null ? null : user.getId();
        return session.users()
                .searchForUserByUserAttributeStream(realm, attributeName, nickname)
                .anyMatch(found -> !Objects.equals(found.getId(), selfId));
    }
}
