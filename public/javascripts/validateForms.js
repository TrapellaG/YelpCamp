(function () {
    'use strict'

    //bsCustomFileInput.init()

    // validate file input
    const fileInput = document.getElementById('image');
    const fileError = document.getElementById('file-error');
    const maxFilesElement = document.getElementById('max-files');
    const maxFiles = maxFilesElement ? parseInt(maxFilesElement.value) : 5;

    if (fileInput && fileError) {
        fileInput.addEventListener('change', function () {
            if (this.files.length > maxFiles) {
                this.setCustomValidity(`You can only upload a maximum of ${maxFiles} images.`);
                this.classList.add('is-invalid');
                fileError.style.display = 'block';
            } else {
                this.setCustomValidity('');
                this.classList.remove('is-invalid');
                fileError.style.display = 'none';
            }
        });
    }

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.validated-form')

    // Loop over them and prevent submission
    Array.from(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
})()