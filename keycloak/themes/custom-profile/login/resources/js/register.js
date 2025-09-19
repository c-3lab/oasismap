function onChangeCheckboxes() {
    const termsCheckbox = document.getElementById('terms-checkbox');
    const submitButton = document.getElementById('submit-button');
    
    if (termsCheckbox && submitButton) {
        submitButton.disabled = !termsCheckbox.checked;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    onChangeCheckboxes();
}); 