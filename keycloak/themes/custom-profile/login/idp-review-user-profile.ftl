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
                        <input type="checkbox" id="terms-checkbox" class="terms-checkbox" name="terms" onchange="onChangeCheckboxes()">
                        <label for="terms-checkbox" class="terms-checkbox-label"><a href="${client.attributes.tosUri}" target="_blank">${msg("termsOfUse")}</a></label>
                    </div>
                    <div>
                        <input type="checkbox" id="privacy-checkbox" class="privacy-checkbox" name="privacy" onchange="onChangeCheckboxes()">
                        <label for="privacy-checkbox" class="privacy-checkbox-label"><a href="${client.attributes.policyUri}" target="_blank">${msg("termsOfPrivacy")}</a></label>
                    </div>
                </div>

                <div id="kc-form-buttons" class="${properties.kcFormButtonsClass!}">
                    <input class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}" type="submit" value="${msg("accountRegistrationLabel")}" id="submitButton" disabled />
                </div>
            </div>
        </form>
    </#if>
</@layout.registrationLayout>