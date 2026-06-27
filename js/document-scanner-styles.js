(function(){
if(document.getElementById('noteclip-scan-review-style'))return;
var s=document.createElement('style');
s.id='noteclip-scan-review-style';
s.textContent='.scan-review-backdrop{position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,.76);display:flex;align-items:center;justify-content:center;padding:18px}.scan-review-card{width:min(620px,100%);max-height:92vh;border-radius:24px;background:#fffaf0;padding:14px;display:flex;flex-direction:column;gap:12px}.scan-review-head{display:flex;align-items:center;justify-content:space-between;color:#2d2110}.scan-review-head button{width:42px;height:42px;border-radius:50%;border:0;background:rgba(45,33,16,.1);font-size:30px;color:#2d2110}.scan-review-card canvas{align-self:center;max-width:100%;border-radius:16px;background:#111}.scan-review-tools{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:8px}.scan-review-tools .btn{min-height:44px}.scan-review-card p{margin:0;color:rgba(45,33,16,.62);font-weight:700;font-size:.88rem;text-align:center}@media(max-width:430px){.scan-review-tools{grid-template-columns:1fr}}';
document.head.appendChild(s);
})();
