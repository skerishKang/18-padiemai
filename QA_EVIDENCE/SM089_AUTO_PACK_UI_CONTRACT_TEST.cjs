const fs=require('fs');const path=require('path');const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'dist/storymemory-auto-pack-ui.js'),'utf8');
const css=fs.readFileSync(path.join(root,'dist/storymemory-auto-pack-ui.css'),'utf8');
const runtime=fs.readFileSync(path.join(root,'dist/storymemory-auto-pack-runtime.js'),'utf8');
const refs=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]).filter(x=>!x.startsWith('http')&&!x.startsWith('data:')&&!x.startsWith('#'));
const missing=refs.filter(ref=>!fs.existsSync(path.join(root,'dist',ref.split(/[?#]/)[0])));
const positions=['storymemory-pack-marketplace-runtime.js','storymemory-source-ui.js','storymemory-pack-marketplace-ui.js','storymemory-auto-pack-runtime.js','storymemory-auto-pack-ui.js'].map(x=>html.indexOf(x));
const checks={
 css_loaded:html.includes('storymemory-auto-pack-ui.css'),
 runtime_loaded:html.includes('storymemory-auto-pack-runtime.js'),
 ui_loaded:html.includes('storymemory-auto-pack-ui.js'),
 script_order:positions.every((x,i)=>x>=0&&(i===0||x>positions[i-1])),
 right_companion_mount:js.includes("sourceTrustControl")&&js.includes("#reader .ai-panel"),
 precision_launcher:js.includes('PRECISION · 정확도 높이기'),
 quick_default:/value="quick" checked/.test(js),
 deep_explicit:/value="deep"/.test(js)&&js.includes("deepConfirmed:mode==='deep'"),
 private_generation_cta:js.includes('PRIVATE PACK 생성·검증'),
 no_auto_publish_copy:js.includes('자동 공개하지 않습니다')&&js.includes('공개 Marketplace에는 올라가지 않았습니다'),
 no_improvement_copy:js.includes('측정 가능한 개선이 없어 Pack을 유지하지 않았습니다'),
 provider_fallback_copy:js.includes('AI Pack 생성 provider가 아직 연결되지 않았습니다'),
 generated_state_copy:js.includes('AUTO-GENERATED · PRIVATE · UNVERIFIED'),
 runtime_private_default:runtime.includes("defaultVisibility:'private'")&&runtime.includes('publicAutoPublish:false'),
 runtime_no_source_body:runtime.includes('sourceBodyInGeneratedPack:false')&&runtime.includes('AUTO_PACK_SOURCE_BODY_FORBIDDEN'),
 local_assets_exist:missing.length===0,
 css_present:css.includes('.auto-pack-panel')&&css.includes('.auto-pack-launch')
};
const result={schema:'storymemory-sm089-auto-pack-ui-contract-result-1.0',positions:Object.fromEntries(['marketRuntime','sourceUi','marketUi','autoRuntime','autoUi'].map((k,i)=>[k,positions[i]])),localRefs:refs.length,missing,checks,pass:Object.values(checks).every(Boolean)};
fs.writeFileSync(path.join(__dirname,'SM089_AUTO_PACK_UI_CONTRACT_RESULT.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));if(!result.pass)process.exit(1);
