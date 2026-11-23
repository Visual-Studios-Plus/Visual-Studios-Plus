/*
 * Case stories for the Corporate Profile, digitised from the 2026 profile PDF.
 *
 * Each story is matched to its case study in site.js (`match` = the start of
 * caseStudies[n][3]) for client, year, tags and metric, and adds:
 *   word   — the brand word that runs as the giant repeating marquee
 *   accent — the brand colour that tints the section
 *   text   — the story copy from the profile
 *   imgs   — /assets/profile/<name>.webp, first is the lead frame; a trailing
 *            `*` marks a transparent cut-out (floats without a frame)
 *   note   — optional footnote
 */
export default [
	/* ---------- Digital case studies ---------- */
	{
		match: 'Nescafé ×', word: 'Nescafé', accent: '#d71920',
		text: 'We spearheaded the entire social media campaign for the Colombo Fashion Week and Nescafé collaboration, crafting a strategy that seamlessly blended fashion and flavour. Capturing top Sri Lankan designers, stylists and industry figures in real time, we delivered dynamic content that positioned Nescafé as a true trendsetter — every video released passed 20K in engagement.',
		imgs: [ 'nescafe-0', 'nescafe-1*', 'nescafe-2', 'nescafe-3' ]
	},
	{
		match: 'Pond’s', word: 'Pond’s', accent: '#5fc8ea',
		text: 'For Pond’s Sri Lanka, we conceptualised and executed a dynamic campaign for Pond’s Super Light Gel, featuring captivating photography and engaging social reels. Through teasers, launch posts and post-launch engagement, the campaign went viral — raising awareness and sparking conversations across their platforms.',
		imgs: [ 'ponds-0', 'ponds-1*', 'ponds-2', 'ponds-3' ]
	},
	{
		match: 'UNDP', word: 'UNDP', accent: '#1f8fe5',
		text: 'We partnered with UNDP to showcase their Hackathon project, promoting social innovation through a trilingual campaign. Our work included poster design, social content and island-wide photography — created in Sinhala, English and Tamil so the campaign reached and resonated with communities across Sri Lanka.',
		imgs: [ 'undp-0', 'undp-1', 'undp-2', 'undp-3' ]
	},
	{
		match: 'Dankotuwa', word: 'Dankotuwa', accent: '#c9a96e',
		text: 'For Dankotuwa Porcelain, we brought the beauty of shared moments to life through a CGI concept — the warmth of tea pouring, the quiet elegance of design and the intimacy of everyday rituals. Photoreal rendering gave the brand a refined, modern presence; from concept to final animation, every frame was crafted by us.',
		imgs: [ 'dankotuwa-0', 'dankotuwa-1*' ]
	},
	{
		match: 'Ministry of Crab', word: 'Ministry of Crab', accent: '#f08a24',
		text: 'We created premium visual content for Sri Lanka’s iconic Ministry of Crab, covering both photography and videography to highlight its rich culinary heritage and world-class seafood.',
		imgs: [ 'crab-2', 'crab-1*', 'crab-0', 'crab-3' ]
	},
	{
		match: 'American Express', word: 'American Express', accent: '#4aa3ff',
		text: 'As title partner of Swim Week Colombo, American Express was positioned as a premium fashion card under its global line, “Don’t Live Without It.” We built its digital presence through a video- and photography-led campaign covering pre-event marketing, event highlights and post-event recaps.',
		imgs: [ 'amex-0', 'amex-1*', 'amex-2', 'amex-3' ]
	},
	{
		match: 'Knorr', word: 'Knorr', accent: '#1aa64b',
		text: 'For Mother’s Day, we partnered with Knorr Sri Lanka to craft a heartfelt campaign celebrating the women who bring warmth, care and flavour to every home.',
		imgs: [ 'knorr-0*', 'knorr-1', 'knorr-2', 'knorr-3' ]
	},

	/* ---------- Digital retainers ---------- */
	{
		match: 'Munchee', word: 'Munchee', accent: '#e2231a',
		text: 'For Munchee CBL, we brought Christmas to life with an AI-powered campaign blending the magic of Lego with their iconic biscuits. From concept to execution, we crafted a social experience that captured festive joy through creativity and innovation.',
		imgs: [ 'munchee-0', 'munchee-1', 'munchee-2', 'munchee-3' ],
		note: 'All visuals in this campaign were created with AI-generated imagery.'
	},
	{
		match: 'Ahmad Tea', word: 'Ahmad Tea', accent: '#d4a24c',
		text: 'We create captivating content for Ahmad Tea, including reels that celebrate the heritage and quality of their teas. From strategy to execution we manage their channels end-to-end, keeping a strong, consistent presence that connects with tea lovers.',
		imgs: [ 'ahmad-0', 'ahmad-1', 'ahmad-2', 'ahmad-3' ]
	},
	{
		match: 'Swisstek', word: 'Swisstek', accent: '#7cc242',
		text: 'We crafted a results-driven social strategy for Swisstek Aluminium, delivering compelling content and impactful designs that strengthened their digital presence — creative storytelling and strategic execution that help a technical brand stand out and grow.',
		imgs: [ 'swisstek-0', 'swisstek-1', 'swisstek-2', 'swisstek-3' ]
	},
	{
		match: 'Swadeshi Khomba — Natural', word: 'Khomba', accent: '#12a150',
		text: 'Bringing the essence of nature to life, we manage Swadeshi Khomba’s digital presence with engaging content, captivating design and strategic paid campaigns. From storytelling to analytics, every touchpoint strengthens the brand.',
		imgs: [ 'khomba-0', 'khomba-1', 'khomba-2', 'khomba-3' ]
	},
	{
		match: 'Imorich', word: 'Imorich', accent: '#c2185b',
		text: 'For over five years we have captured stunning visuals, dynamic reels and strategic campaigns that elevate Imorich — compelling storytelling and high-quality photography that reflect the richness and indulgence of their ice cream.',
		imgs: [ 'imorich-0', 'imorich-1*', 'imorich-2', 'imorich-3*' ]
	},

	/* ---------- Branding ---------- */
	{
		match: 'SOZO', word: 'Sozo', accent: '#f4dc3a',
		text: 'A fresh identity for SOZO, crafted to reflect the vibrancy of its flavours — from the purity of Original to the tropical notes of passion fruit and mango. Each label captures the essence of the drink: clean, refreshing and full of character.',
		imgs: [ 'sozo-0*', 'sozo-1*', 'sozo-2*', 'sozo-3*' ]
	},
	{
		match: 'Too Good', word: 'Too Good', accent: '#f5a623',
		text: 'A refined identity for Too Good Chocolatier — from logo design into a cohesive brand guideline, then label design for Pistachio Kunafection and Crunchy Biscoveries. A visual language that feels premium, distinctive and irresistibly crafted.',
		imgs: [ 'toogood-0*', 'toogood-1*', 'toogood-2*', 'toogood-3*' ]
	},
	{
		match: 'Viva La Vida', word: 'Viva La Vida', accent: '#7fd6d6',
		text: 'A refined visual expression for Viva La Vida skincare through labels across the range and cohesive packaging — fresh, gentle and elevated, bringing consistency and quiet luxury to every touchpoint.',
		imgs: [ 'vivalavida-0*', 'vivalavida-1*', 'vivalavida-2*' ]
	},
	{
		match: 'CBW', word: 'CBW', accent: '#ff7a1a',
		text: 'CBW is a Cairns bicycle store rooted in local cycling culture since 1997. Its minimalist logo takes the sleek lines of a bicycle — geometric shapes that convey motion and adventure, for a brand that is modern and dynamic. The journey of a bicycle never ends.',
		imgs: [ 'cbw-0', 'cbw-1*', 'cbw-2*' ]
	},
	{
		match: 'Te Dalu', word: 'Te Dalu', accent: '#d7a640',
		text: 'A distinctive identity for Te Dalu, a boutique hotel in Ella — logo and comprehensive brand guide, extended through a series of labels that echo the hotel’s character: its charm, its surroundings and its sense of place.',
		imgs: [ 'tedalu-1*', 'tedalu-0', 'tedalu-2*' ]
	},

	/* ---------- TVC ---------- */
	{
		match: 'Viva Malted', word: 'Viva', accent: '#e30613',
		text: 'For Viva’s Avurudu campaign we crafted a vibrant video series celebrating the Sinhala and Tamil New Year — captivating visuals and storytelling that made Viva part of every Avurudu table.',
		imgs: [ 'viva-0', 'viva-1', 'viva-2', 'viva-3' ]
	},
	{
		match: 'MintPay', word: 'MintPay', accent: '#19c37d',
		text: 'From concept to screen, we brought MintPay’s Digital Vouchers to life with a full-scale commercial — scripting, storyboarding, filming and final edit, every frame crafted to connect, engage and inform a digital-savvy audience.',
		imgs: [ 'mintpay-1*', 'mintpay-0' ]
	},
	{
		match: 'Swadeshi Khomba — Women', word: 'Swadeshi', accent: '#2fb36b',
		text: 'A meaningful TVC for Swadeshi Khomba’s Women’s Day campaign, celebrating the strength and natural beauty of Sri Lankan women — emotional storytelling and cultural authenticity around the brand’s iconic herbal soap.',
		imgs: [ 'swadeshiwd-0*', 'swadeshiwd-1', 'swadeshiwd-2' ]
	},
	{
		match: 'DSI', word: 'DSI', accent: '#ff6f61',
		text: 'From concept to post-production we handled the full creative and executional scope of DSI’s Women’s Day film — fast turnarounds, shifting creative and detailed planning — telling the strength and everyday journeys of Sri Lankan women.',
		imgs: [ 'dsi-1*', 'dsi-0' ]
	},

	/* ---------- Photography ---------- */
	{
		match: 'Sapphire Dragon', word: 'Sapphire Dragon', accent: '#3b6fd8',
		text: 'End-to-end content and paid media for Hilton Colombo, Hilton Residencies and DoubleTree by Hilton — photography, videography and digital campaigns that elevated their premium hospitality, including the Sapphire Dragon Chinese restaurant.',
		imgs: [ 'sapphire-0', 'sapphire-1', 'sapphire-2', 'sapphire-3*' ]
	}
];
