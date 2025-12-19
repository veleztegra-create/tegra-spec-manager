// js/utils/image-helpers.js
export function handleImageUpload(e, callback) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        if (callback) callback(e.target.result);
    };
    reader.readAsDataURL(file);
}

export function handleImagePaste(e, callback) {
    if (e.clipboardData && e.clipboardData.items) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (callback) callback(e.target.result);
                };
                reader.readAsDataURL(blob);
                break;
            }
        }
    }
}
