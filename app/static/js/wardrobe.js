// Wardrobe management functionality

document.addEventListener('DOMContentLoaded', function() {
    loadWardrobeItems();
});

function loadWardrobeItems() {
    // This would fetch from an API endpoint
    // For now, items are rendered server-side in the template
}

function editItem(itemId) {
    // Show edit form modal or inline edit
    alert('Edit functionality - item ID: ' + itemId);
}

function deleteItem(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/wardrobe/delete/${itemId}`;
        document.body.appendChild(form);
        form.submit();
    }
}
