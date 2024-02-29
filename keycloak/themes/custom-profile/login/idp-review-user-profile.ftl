<#import "template-idp-review-user-profile.ftl" as layout>
<div id="custom-header" class="custom-header">
    <div class="custom-header-label">${realm.displayNameHtml!''}</div>
</div>
<#import "user-profile-commons.ftl" as userProfileCommons>
<@layout.registrationLayout displayMessage=messagesPerField.exists('global') displayRequiredFields=true; section>
    <#if section = "header">
        ${msg("loginIdpReviewProfileTitle")}
    <#elseif section = "form">
        <form id="kc-idp-review-profile-form" class="${properties.kcFormClass!}" action="${url.loginAction}" method="post">

            <@userProfileCommons.userProfileFormFields/>

            <div class="${properties.kcFormGroupClass!}">
                <div id="kc-form-options" class="${properties.kcFormOptionsClass!}">
                    <div>
                        <input type="checkbox" id="termsCheckbox" class="termsCheckbox" name="terms" onchange="checkCheckboxes()">
                        <label for="termsCheckbox" class="termsCheckboxLabel"><a href="利用規約URL" target="_blank">利用規約</a></label>
                    </div>
                    <div>
                        <input type="checkbox" id="privacyCheckbox" class="privacyCheckbox" name="privacy" onchange="checkCheckboxes()">
                        <label for="privacyCheckbox" class="privacyCheckboxLabel"><a href="プライバシーポリシーURL" target="_blank">プライバシーポリシー</a></label>
                    </div>
                </div>

                <div id="kc-form-buttons" class="${properties.kcFormButtonsClass!}">
                    <input class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}" type="submit" value="${msg("accountRegistrationLabel")}" id="submitButton" disabled />
                </div>
            </div>
        </form>
    </#if>
</@layout.registrationLayout>