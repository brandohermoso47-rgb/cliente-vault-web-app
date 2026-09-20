// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function Login({ v }: { v: any }) {
  return (
    <>
    <div style={{"position":"relative","minHeight":"100vh","display":"flex","alignItems":"center","justifyContent":"center","padding":"48px 24px","background":"radial-gradient(130% 100% at 50% 44%, #16171A 0%, #0B0B0D 48%, #000000 100%)","overflow":"hidden"}}>
      <div style={{"position":"absolute","inset":"0","background":"radial-gradient(120% 90% at 50% 45%, rgba(20,20,23,.55), rgba(0,0,0,.9))","pointerEvents":"none"}}></div>
      <div style={{"position":"relative","width":"100%","maxWidth":"470px","padding":"44px 40px 30px","borderRadius":"22px","background":"linear-gradient(160deg, rgba(226,232,240,.16), rgba(148,163,184,.07))","backdropFilter":"blur(40px) saturate(150%)","WebkitBackdropFilter":"blur(40px) saturate(150%)","border":"1px solid rgba(202,210,242,.3)","boxShadow":"inset 0 1px 0 rgba(232,237,255,.42), 0 44px 96px -32px rgba(0,0,0,.75)","textAlign":"center"}}>
        <img src="uploads/waack_on_gold_3d_depth.png" alt="Waack On" style={{"width":"196px","height":"196px","objectFit":"contain","display":"block","margin":"0 auto","filter":"drop-shadow(0 18px 44px rgba(0,0,0,.8))"}} />
        <div style={{"height":"30px"}}></div>
        <input type="email" value={v.loginEmail} onChange={v.onEmail} placeholder="Email Address" style={{"display":"block","width":"100%","boxSizing":"border-box","padding":"16px 20px","marginBottom":"15px","borderRadius":"14px","border":"1px solid rgba(202,210,242,.34)","background":"rgba(160,168,205,.16)","boxShadow":"inset 0 1px 0 rgba(230,235,255,.3)","fontFamily":"Geist,sans-serif","fontSize":"15px","color":"#fff","outline":"none"}} className={cx(pc("focus", "border-color:rgba(255,122,74,.8)"))} />
        <input type="password" value={v.loginPass} onChange={v.onPass} placeholder="Password" style={{"display":"block","width":"100%","boxSizing":"border-box","padding":"16px 20px","marginBottom":"10px","borderRadius":"14px","border":"1px solid rgba(202,210,242,.34)","background":"rgba(160,168,205,.16)","boxShadow":"inset 0 1px 0 rgba(230,235,255,.3)","fontFamily":"Geist,sans-serif","fontSize":"15px","color":"#fff","outline":"none"}} className={cx(pc("focus", "border-color:rgba(255,122,74,.8)"))} />
        <div onClick={v.forgotPassword} style={{"textAlign":"right","fontSize":"13px","color":"rgba(226,231,255,.82)","textDecoration":"underline","marginBottom":"24px","cursor":"pointer"}} className={cx(pc("hover", "color:#fff"))}>
          {"Forgot Password?"}
        </div>
        {v.loginInfo && (
          <>
            <div style={{"textAlign":"left","fontSize":"12px","color":"#8FE3B0","margin":"-10px 0 14px"}}>
              {v.loginInfo}
            </div>
          </>
        )}
        {v.loginError && (
          <>
            <div style={{"textAlign":"left","fontSize":"12px","color":"#FF9A7A","margin":"-10px 0 14px"}}>
              {v.loginError}
            </div>
          </>
        )}
        <div onClick={v.submitLogin} style={{"position":"relative","overflow":"hidden","padding":"16px","borderRadius":"14px","fontSize":"15px","fontWeight":"700","color":"#fff","background":"linear-gradient(90deg,#FF7A2F,#FF2E86)","boxShadow":"0 14px 34px -10px rgba(255,60,130,.65), inset 0 1px 0 rgba(255,255,255,.45)","cursor":"pointer","transition":"transform .2s cubic-bezier(.2,.85,.25,1), box-shadow .2s ease"}} className={cx(pc("hover", "transform:translateY(-2px);box-shadow:0 20px 44px -12px rgba(255,60,130,.8), inset 0 1px 0 rgba(255,255,255,.5)"))}>
          <span style={{"position":"relative"}}>
            {v.loginSubmitLabel}
          </span>
        </div>
        <div style={{"fontSize":"13px","color":"rgba(226,231,255,.72)","marginTop":"22px"}}>
          {v.loginSwitchText}
          {" "}
          <b onClick={v.toggleLoginMode} style={{"color":"#fff","cursor":"pointer","textDecoration":"underline","textUnderlineOffset":"3px"}}>
            {v.loginSwitchLabel}
          </b>
        </div>
        <div style={{"display":"flex","gap":"6px","padding":"5px","marginTop":"28px","borderRadius":"999px","background":"var(--glass-2)","border":"1px solid var(--hair)"}}>
          <div onClick={v.setDark} style={sty(v.themeDarkBtn)}>
            {"Oscuro"}
          </div>
          <div onClick={v.setLight} style={sty(v.themeLightBtn)}>
            {"Claro"}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
