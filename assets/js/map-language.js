document.addEventListener('DOMContentLoaded', () => {
    const worldMap = document.getElementById('world-map');
    const languageDetails = document.getElementById('language-details');

    if (worldMap && languageDetails) {
        // Function to simulate showing language details based on clicked area
        // In a real application, you'd use SVG path coordinates and more complex logic
        // or a dedicated map library (e.g., D3.js, Leaflet)

        worldMap.addEventListener('click', (event) => {
            const clickX = event.offsetX;
            const clickY = event.offsetY;

            // Simplified logic: determine a region based on click coordinates
            let language = 'نامشخص';
            let description = 'برای این منطقه اطلاعات زبانی خاصی موجود نیست.';

            // Example simple region detection (replace with actual SVG/map interaction)
            if (clickX > 500 && clickX < 700 && clickY > 200 && clickY < 400) {
                language = 'انگلیسی';
                description = 'انگلیسی به عنوان زبان جهانی و در بسیاری از کشورها پشتیبانی می‌شود.';
            } else if (clickX > 300 && clickX < 500 && clickY > 300 && clickY < 500) {
                language = 'عربی';
                description = 'زبان عربی در خاورمیانه و شمال آفریقا رواج دارد.';
            } else if (clickX > 700 && clickX < 900 && clickY > 250 && clickY < 450) {
                language = 'اسپانیایی';
                description = 'اسپانیایی در اسپانیا و بسیاری از کشورهای آمریکای لاتین صحبت می‌شود.';
            } else if (clickX > 200 && clickX < 400 && clickY > 200 && clickY < 400) {
                language = 'چینی';
                description = 'چینی ماندارین پرگویش‌ترین زبان در جهان است و در چین اصلی استفاده می‌شود.';
            } else if (clickX > 450 && clickX < 550 && clickY > 300 && clickY < 350) { // Example for Iran area
                language = 'فارسی';
                description = 'زبان فارسی در ایران، افغانستان و تاجیکستان صحبت می‌شود و توسط هوما به طور کامل پشتیبانی می‌شود.';
            }

            // Update the language details section
            languageDetails.innerHTML = `<h3>${language}</h3><p>${description}</p>`;
        });

        // Initial message for the details section
        languageDetails.innerHTML = `<h3>برای مشاهده جزئیات زبان، روی نقشه کلیک کنید.</h3><p>برای مشاهده زبان‌های پشتیبانی شده و مناطق جغرافیایی آن‌ها، روی بخش‌های مختلف نقشه کلیک کنید.</p>`;
    }
});