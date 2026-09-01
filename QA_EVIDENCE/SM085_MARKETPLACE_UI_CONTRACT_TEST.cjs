const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const ui=fs.readFileSync(path.join(dist,'storymemory-pack-marketplace-ui.js'),'utf8');
const css=fs.readFileSync(path.join(dist,'storymemory-pack-marketplace-ui.css'),'utf8');
const runtime=fs.readFileSync(path.join(dist,'storymemory-pack-marketplace-runtime.js'),'utf8');
const catalog=JSON.parse(fs.readFileSync(path.join(dist,'packs/marketplace-catalog-v1.json'),'utf8'));
const pack=JSON.parse(fs.readFileSync(path.join(dist,'packs/odyssey-korean-alias-public-v1.json'),'utf8'));
const checks={
 scripts_loaded:html.includes('<script src="storymemory-pack-marketplace-runtime.js"></script>')&&html.includes('<script src="storymemory-pack-marketplace-ui.js"></script>'),
 css_loaded:html.includes('storymemory-pack-marketplace-ui.css'),
 universal_before_marketplace:html.indexOf('storymemory-universal-source-runtime.js')<html.indexOf('storymemory-pack-marketplace-runtime.js'),
 source_ui_before_marketplace_ui:html.indexOf('storymemory-source-ui.js')<html.indexOf('storymemory-pack-marketplace-ui.js'),
 right_panel_mount:ui.includes("d.getElementById('sourceTrustControl')")&&ui.includes('PACK MARKETPLACE'),
 static_fallback_catalog:ui.includes("packs/marketplace-catalog-v1.json"),
 neon_bridge:ui.includes('storyMemoryEnableNeonPackRegistry')&&runtime.includes('createStoryMemoryNeonPackRegistryProvider'),
 free_public_listing:catalog.listings.length===1&&catalog.listings[0].visibility==='public'&&catalog.listings[0].pricingMode==='free'&&catalog.listings[0].publicationStatus==='published',
 no_source_body:catalog.listings.every(x=>x.sourceTextIncluded===false)&&pack.rights.sourceTextIncluded===false,
 unverified_default:catalog.listings[0].versions[0].declaredTrustTier==='auto-generated'&&catalog.listings[0].attestations.length===0,
 paid_not_implemented:runtime.includes('paidProcessingImplemented:false')&&runtime.includes('PAID_ENTITLEMENT_REQUIRED_NOT_IMPLEMENTED'),
 book_ui_not_replaced:html.includes('book-stage')||html.includes('bookshelf')||html.includes('shelf'),
 marketplace_css:css.includes('.pack-marketplace-panel')&&css.includes('.pack-marketplace-card')
};
const result={schema:'storymemory-sm085-marketplace-ui-contract-1.0',checks,pass:Object.values(checks).every(Boolean)};
fs.writeFileSync(path.join(__dirname,'SM085_MARKETPLACE_UI_CONTRACT_RESULT.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));if(!result.pass)process.exit(1);
