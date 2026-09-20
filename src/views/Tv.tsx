// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function Tv({ v }: { v: any }) {
  return (
    <>
    <div style={{"display":"flex","flexDirection":"column","gap":"22px","maxWidth":"1280px"}}>
      <div style={sty(v.tvPlate)}>
        <div style={{"display":"flex","alignItems":"center","gap":"18px","flexWrap":"wrap"}}>
          <div style={{"width":"46px","height":"46px","flex":"0 0 46px","borderRadius":"14px","display":"flex","alignItems":"center","justifyContent":"center","color":"#fff","background":"linear-gradient(140deg,var(--pink),var(--purple))","boxShadow":"var(--lg-lift)"}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="2" y="7" width="20" height="14" rx="3"></rect>
              <path d="m7 3 5 4 5-4"></path>
            </svg>
          </div>
          <div style={{"flex":"1","minWidth":"240px"}}>
            <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
              {"Canal del bailarín"}
            </div>
            <div style={{"fontSize":"16px","fontWeight":"700","color":"var(--ink)","marginTop":"5px"}}>
              {v.tvConnectTitle}
            </div>
            <div style={{"fontSize":"12.5px","lineHeight":"1.5","color":"var(--ink-2)","marginTop":"4px","maxWidth":"520px","textWrap":"pretty"}}>
              {v.tvConnectHint}
            </div>
          </div>
          {v.tvOffline && (
            <>
              <div onClick={v.tvConnect} style={{"display":"flex","alignItems":"center","gap":"9px","padding":"12px 20px","borderRadius":"999px","fontSize":"12.5px","fontWeight":"700","color":"#14111A","background":"var(--pink)","boxShadow":"0 10px 22px -10px var(--pink), inset 0 1px 0 rgba(255,255,255,.3)","cursor":"pointer","whiteSpace":"nowrap"}} className={cx(pc("hover", "transform:translateY(-1px)"))}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                  <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.8 1.7"></path>
                  <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7L12 19"></path>
                </svg>
                {" Conectar cuenta de YouTube "}
              </div>
            </>
          )}
          {v.tvConnected && (
            <>
              <div style={{"display":"flex","alignItems":"center","gap":"12px","flexWrap":"wrap"}}>
                <div style={{"display":"flex","alignItems":"center","gap":"10px","padding":"9px 14px","borderRadius":"999px","border":"1px solid var(--hair)","background":"var(--glass-2)","boxShadow":"var(--lg-edge)"}}>
                  <span style={{"width":"26px","height":"26px","borderRadius":"50%","background":"linear-gradient(135deg,var(--purple),var(--blue))"}}></span>
                  <span style={{"fontSize":"12px","fontWeight":"700","color":"var(--ink)"}}>
                    {"@waackon.lab"}
                  </span>
                  <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)"}}>
                    {"2.4K subs"}
                  </span>
                </div>
                <div style={{"display":"flex","alignItems":"center","gap":"8px","padding":"12px 18px","borderRadius":"999px","fontSize":"12.5px","fontWeight":"700","color":"#F6F4FA","background":"color-mix(in srgb, var(--purple) 84%, #0D0A12)","boxShadow":"0 10px 22px -10px var(--purple)","cursor":"pointer","whiteSpace":"nowrap"}} className={cx(pc("hover", "transform:translateY(-1px)"))}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                    <path d="M12 5v14"></path>
                    <path d="M5 12h14"></path>
                  </svg>
                  {" Publicar mi canal "}
                </div>
                <div onClick={v.tvConnect} style={{"padding":"12px 16px","borderRadius":"999px","fontSize":"12px","fontWeight":"600","color":"var(--ink-2)","border":"1px solid var(--hair)","background":"var(--glass-2)","cursor":"pointer","whiteSpace":"nowrap"}} className={cx(pc("hover", "color:var(--ink)"))}>
                  {"Desconectar"}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div style={{"display":"flex","gap":"8px","flexWrap":"wrap"}}>
        {(v.tvCats ?? []).map((c: any, $index: number) => (
          <Fragment key={$index}>
            <div onClick={c?.pick} style={sty(c?.style)} className={cx(pc("hover", v.chipHover3d))}>
              {c?.name}
            </div>
          </Fragment>
        ))}
      </div>
      <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(320px,1fr))","gap":"20px","alignItems":"start"}}>
        <div style={{"gridColumn":"span 2","minWidth":"0","display":"flex","flexDirection":"column","gap":"16px","borderRadius":"26px","overflow":"hidden","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"blur(30px)","WebkitBackdropFilter":"blur(30px)","boxShadow":"var(--lg-edge)"}}>
          <div style={sty(`position:relative;aspect-ratio:16/9;width:100%;background:${v.tvHeroThumb ?? ""};display:flex;align-items:center;justify-content:center`)}>
            <div style={{"position":"absolute","inset":"0","background":"linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.62))"}}></div>
            <div style={{"position":"relative","width":"66px","height":"66px","borderRadius":"50%","display":"flex","alignItems":"center","justifyContent":"center","color":"#0D0D0D","background":"rgba(255,255,255,.94)","boxShadow":"0 18px 40px -18px rgba(0,0,0,.8)","cursor":"pointer"}} className={cx(pc("hover", "transform:scale(1.06)"))}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.2v13.6L19 12z"></path>
              </svg>
            </div>
            <span style={{"position":"absolute","left":"16px","top":"16px","display":"inline-flex","alignItems":"center","gap":"6px","fontFamily":"'Geist Mono',monospace","fontSize":"9px","fontWeight":"700","letterSpacing":".14em","color":"#fff","background":"var(--pink)","padding":"5px 10px","borderRadius":"999px"}}>
              <span style={{"width":"5px","height":"5px","borderRadius":"50%","background":"#fff"}}></span>
              {"EN VIVO "}
            </span>
            <span style={{"position":"absolute","right":"16px","bottom":"16px","fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"#fff","background":"rgba(0,0,0,.66)","padding":"4px 9px","borderRadius":"7px"}}>
              {"18:42"}
            </span>
            <div style={{"position":"absolute","left":"0","right":"0","bottom":"0","height":"4px","background":"rgba(255,255,255,.22)"}}>
              <div style={{"width":"38%","height":"100%","background":"var(--pink)"}}></div>
            </div>
          </div>
          <div style={{"padding":"0 24px 24px","display":"flex","flexDirection":"column","gap":"16px"}}>
            <div>
              <h2 style={{"margin":"0","fontSize":"22px","fontWeight":"700","letterSpacing":"-0.01em","color":"var(--ink)","textWrap":"pretty"}}>
                {"Twirl y punto: cómo limpiar la muñeca en tempo 128"}
              </h2>
              <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10.5px","color":"var(--ink-3)","marginTop":"7px"}}>
                {"14.8K vistas · hace 2 días · Temporada de práctica"}
              </div>
            </div>
            <div style={{"display":"flex","alignItems":"center","gap":"14px","flexWrap":"wrap","paddingTop":"14px","borderTop":"1px solid var(--hair-soft)"}}>
              <span style={{"width":"40px","height":"40px","borderRadius":"50%","flex":"0 0 40px","background":"linear-gradient(135deg,var(--blue),var(--purple))"}}></span>
              <div style={{"flex":"1","minWidth":"150px"}}>
                <div style={{"fontSize":"13.5px","fontWeight":"700","color":"var(--ink)"}}>
                  {"Waack On Studio"}
                </div>
                <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","marginTop":"3px"}}>
                  {"12.1K suscriptores"}
                </div>
              </div>
              <div style={{"padding":"11px 20px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"#14111A","background":"var(--pink)","boxShadow":"0 10px 22px -10px var(--pink), inset 0 1px 0 rgba(255,255,255,.3)","cursor":"pointer","whiteSpace":"nowrap"}} className={cx(pc("hover", "transform:translateY(-1px)"))}>
                {"Suscribirme"}
              </div>
              <div style={{"display":"flex","alignItems":"center","gap":"0","borderRadius":"999px","border":"1px solid var(--hair)","background":"var(--glass-2)","overflow":"hidden"}}>
                <div style={{"display":"flex","alignItems":"center","gap":"7px","padding":"10px 15px","fontSize":"12px","fontWeight":"600","color":"var(--ink-2)","cursor":"pointer"}} className={cx(pc("hover", "color:var(--ink)"))}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z"></path>
                    <path d="M7 10l4.2-7a2 2 0 0 1 3.7 1.2l-.6 4.3H19a2 2 0 0 1 2 2.3l-1.1 7A2 2 0 0 1 18 21H7Z"></path>
                  </svg>
                  {" 842 "}
                </div>
                <span style={{"width":"1px","height":"20px","background":"var(--hair)"}}></span>
                <div style={{"padding":"10px 15px","fontSize":"12px","fontWeight":"600","color":"var(--ink-2)","cursor":"pointer"}} className={cx(pc("hover", "color:var(--ink)"))}>
                  {"Guardar"}
                </div>
                <span style={{"width":"1px","height":"20px","background":"var(--hair)"}}></span>
                <div style={{"padding":"10px 15px","fontSize":"12px","fontWeight":"600","color":"var(--ink-2)","cursor":"pointer"}} className={cx(pc("hover", "color:var(--ink)"))}>
                  {"Compartir"}
                </div>
              </div>
            </div>
            <p style={{"margin":"0","fontSize":"13px","lineHeight":"1.6","color":"var(--ink-2)","textWrap":"pretty"}}>
              {"Clase abierta del laboratorio: descomposición del twirl en cuatro tiempos, corrección del codo y transición al punto. Marcadores de capítulo en la descripción."}
            </p>
          </div>
        </div>
        <div style={{"minWidth":"0","display":"flex","flexDirection":"column","gap":"14px","padding":"20px","borderRadius":"26px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"blur(30px)","WebkitBackdropFilter":"blur(30px)","boxShadow":"var(--lg-edge)"}}>
          <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"10px"}}>
            <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
              {"A continuación"}
            </div>
            <div style={{"fontSize":"11.5px","fontWeight":"600","color":"var(--ink)","cursor":"pointer"}} className={cx(pc("hover", "color:var(--pink)"))}>
              {"Mezclar"}
            </div>
          </div>
          {(v.tvQueue ?? []).map((q: any, $index: number) => (
            <Fragment key={$index}>
              <div style={{"display":"flex","gap":"12px","padding":"8px","borderRadius":"16px","cursor":"pointer","transition":"background .18s ease"}} className={cx(pc("hover", "background:var(--glass-2)"))}>
                <div style={sty(`position:relative;width:104px;height:60px;flex:0 0 104px;border-radius:11px;overflow:hidden;background:${q?.thumb ?? ""}`)}>
                  <span style={{"position":"absolute","right":"5px","bottom":"5px","fontFamily":"'Geist Mono',monospace","fontSize":"8.5px","color":"#fff","background":"rgba(0,0,0,.7)","padding":"2px 5px","borderRadius":"5px"}}>
                    {q?.dur}
                  </span>
                </div>
                <div style={{"minWidth":"0","flex":"1"}}>
                  <div style={{"fontSize":"12.5px","fontWeight":"700","lineHeight":"1.35","color":"var(--ink)","textWrap":"pretty"}}>
                    {q?.title}
                  </div>
                  <div style={{"fontSize":"11px","color":"var(--ink-2)","marginTop":"4px"}}>
                    {q?.channel}
                  </div>
                  <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9.5px","color":"var(--ink-3)","marginTop":"3px"}}>
                    {q?.meta}
                  </div>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
      <div style={{"display":"flex","flexDirection":"column","gap":"14px"}}>
        <div style={{"display":"flex","alignItems":"center","gap":"7px"}}>
          <span style={{"width":"5px","height":"5px","borderRadius":"50%","background":"var(--pink)"}}></span>
          <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
            {v.tvGridLabel}
          </span>
        </div>
        <div style={sty(v.cardGrid)}>
          {(v.tvVideos ?? []).map((v: any, $index: number) => (
            <Fragment key={$index}>
              <div style={sty(v?.card)} className={cx(pc("hover", "transform:translateY(-4px)"))}>
                <div style={sty(`position:relative;aspect-ratio:16/9;width:100%;background:${v?.thumb ?? ""}`)}>
                  <span style={{"position":"absolute","right":"9px","bottom":"9px","fontFamily":"'Geist Mono',monospace","fontSize":"9px","color":"#fff","background":"rgba(0,0,0,.7)","padding":"3px 7px","borderRadius":"6px"}}>
                    {v?.dur}
                  </span>
                </div>
                <div style={{"padding":"14px 16px 18px","display":"flex","gap":"11px"}}>
                  <span style={sty(v?.avatar)}></span>
                  <div style={{"minWidth":"0","flex":"1"}}>
                    <div style={{"fontSize":"13px","fontWeight":"700","lineHeight":"1.35","color":"var(--ink)","textWrap":"pretty"}}>
                      {v?.title}
                    </div>
                    <div style={{"fontSize":"11.5px","color":"var(--ink-2)","marginTop":"5px"}}>
                      {v?.channel}
                    </div>
                    <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9.5px","color":"var(--ink-3)","marginTop":"3px"}}>
                      {v?.meta}
                    </div>
                  </div>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
      <div style={{"display":"flex","flexDirection":"column","gap":"14px","paddingTop":"6px","borderTop":"1px solid var(--hair-soft)"}}>
        <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
          {"Canales de la comunidad"}
        </div>
        <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fill,minmax(230px,1fr))","gap":"14px"}}>
          {(v.tvChannels ?? []).map((ch: any, $index: number) => (
            <Fragment key={$index}>
              <div style={{"display":"flex","alignItems":"center","gap":"13px","padding":"15px 17px","borderRadius":"20px","border":"1px solid var(--hair)","background":"var(--glass-2)","boxShadow":"var(--lg-edge)","cursor":"pointer"}} className={cx(pc("hover", "border-color:var(--pink)"))}>
                <span style={sty(ch?.avatar)}></span>
                <div style={{"minWidth":"0","flex":"1"}}>
                  <div style={{"fontSize":"12.5px","fontWeight":"700","color":"var(--ink)","whiteSpace":"nowrap","overflow":"hidden","textOverflow":"ellipsis"}}>
                    {ch?.name}
                  </div>
                  <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9.5px","color":"var(--ink-3)","marginTop":"4px"}}>
                    {ch?.subs}
                  </div>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
