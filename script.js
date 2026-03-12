document.addEventListener('DOMContentLoaded', () => {
    
    // UI Elements
    const root = document.documentElement;
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Input Elements
    const inputs = {
        headline: document.getElementById('headline'),
        subheadline: document.getElementById('subheadline'),
        ctaText: document.getElementById('ctaText'),
        successMsg: document.getElementById('successMsg'),
        layout: document.getElementById('layoutSelect'),
        theme: document.getElementById('themeSelect')
    };

    // Preview Elements
    const preview = {
        container: document.getElementById('leadMagnet'),
        headline: document.getElementById('prevHeadline'),
        subheadline: document.getElementById('prevSubheadline'),
        ctaText: document.getElementById('prevCta'),
        form: document.getElementById('prevForm')
    };

    // Modals
    const publishBtn = document.getElementById('publishBtn');
    const modal = document.getElementById('publishModal');
    const closeBtn = document.getElementById('closeModal');
    const embedCodeEl = document.getElementById('embedCode');
    const copyBtn = document.getElementById('copyCodeBtn');

    // === TABS LOGIC ===
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab + 'Tab').classList.add('active');
        });
    });

    // === REAL-TIME PREVIEW UPDATE ===
    function updatePreview() {
        preview.headline.textContent = inputs.headline.value || 'Your Headline Here';
        preview.subheadline.textContent = inputs.subheadline.value || 'Subheadline text';
        preview.ctaText.textContent = inputs.ctaText.value || 'Submit';
        
        // Layout Update
        preview.container.className = `lead-magnet-preview layout-${inputs.layout.value} theme-${inputs.theme.value}`;
    }

    // Attach listeners to text inputs
    ['headline', 'subheadline', 'ctaText'].forEach(id => {
        inputs[id].addEventListener('input', updatePreview);
    });

    // Attach listener to dropdowns
    inputs.layout.addEventListener('change', updatePreview);
    inputs.theme.addEventListener('change', updatePreview);

    // === DESIGN: COLOR PICKER ===
    const colorBtns = document.querySelectorAll('.color-btn');
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Unset active
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Set CSS Variable explicitly to the selected HSL values
            const colorHslArray = btn.dataset.color; // e.g., "255, 60%, 55%"
            
            // Update the CSS variables on the root document for live preview
            root.style.setProperty('--lm-primary', `hsl(${colorHslArray})`);
            
            // Generate a 'hover' version (slightly lighter/darker)
            const parts = colorHslArray.split(',');
            const lightness = parseInt(parts[2].trim().replace('%',''));
            const hoverLightness = lightness + 7; 
            root.style.setProperty('--lm-primary-hover', `hsl(${parts[0]}, ${parts[1]}, ${hoverLightness}%)`);
        });
    });

    // === SUCCESS STATE SIMULATION ===
    preview.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const originalBtnText = preview.ctaText.innerHTML;
        preview.ctaText.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Processing...';
        
        setTimeout(() => {
            preview.ctaText.innerHTML = `<i class="ph ph-check-circle"></i> ${inputs.successMsg.value}`;
            preview.ctaText.style.backgroundColor = 'var(--ui-success)';
            
            // Reset after 3 seconds
            setTimeout(() => {
                preview.ctaText.innerHTML = originalBtnText;
                preview.ctaText.style.backgroundColor = 'var(--lm-primary)';
                preview.form.reset();
            }, 3000);
        }, 800);
    });

    // === PUBLISH LOGIC (Generate Embed Code) ===
    function generateEmbedCode() {
        // We will grab the styles and html structure to generate a clean raw snippet.
        // For production, this logic would package styles specifically scoped.
        
        const activeColorBtn = document.querySelector('.color-btn.active').dataset.color;
        
        const embedHtml = `
<!-- LeadMagnetPro Embed -->
<style>
  .lmp-embed {
    --lm-primary: hsl(${activeColorBtn});
    --font-main: 'Outfit', sans-serif;
     /* Added scoped styling specifically for the embed container */
  }
  /* (In a full app, we would bundle minified CSS for the specific classes here) */
</style>
<!-- Load Fonts and Icons -->
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
<script src="https://unpkg.com/@phosphor-icons/web"></script>

<div class="lmp-embed">
  ${preview.container.outerHTML.replace('id="leadMagnet"', 'id="lmp-container"')}
</div>
<script>
  // Script handling the standalone form submission
</script>
<!-- End LeadMagnetPro Embed -->`;
        
        // Very basic sanitization/escaping for pre code block display
        return embedHtml.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    publishBtn.addEventListener('click', () => {
        embedCodeEl.innerHTML = generateEmbedCode();
        modal.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        copyBtn.innerHTML = '<i class="ph ph-copy"></i> Copy Code';
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        const textToCopy = embedCodeEl.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            copyBtn.innerHTML = '<i class="ph ph-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="ph ph-copy"></i> Copy Code';
            }, 2000);
        });
    });

    // Run initial update to sync DOM state
    updatePreview();
});
