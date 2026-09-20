// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function Podcast({ v }: { v: any }) {
  return (
    <>
    <div style={{"display":"flex","flexDirection":"column","gap":"24px","maxWidth":"1180px"}}>
      <div style={{"display":"flex","gap":"8px","flexWrap":"wrap"}}>
        <div style={sty(v.chipLive)}>
          {"Temporada 2"}
        </div>
        <div style={sty(v.chipOff)} className={cx(pc("hover", v.chipHover3d))}>
          {"Temporada 1"}
        </div>
        <div style={sty(v.chipOff)} className={cx(pc("hover", v.chipHover3d))}>
          {"Invitados"}
        </div>
      </div>
      <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(300px,1fr))","gap":"20px","alignItems":"start"}}>
        <div style={{"gridColumn":"span 2","minWidth":"0","borderRadius":"26px","overflow":"hidden","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"blur(30px)","WebkitBackdropFilter":"blur(30px)","boxShadow":"var(--lg-edge)"}}>
          <div style={{"padding":"26px","display":"flex","gap":"24px","flexWrap":"wrap"}}>
            <div style={{"width":"184px","height":"184px","flex":"0 0 184px","borderRadius":"22px","position":"relative","overflow":"hidden","background":"linear-gradient(140deg, color-mix(in oklch, var(--purple) 58%, #000 26%), color-mix(in oklch, var(--pink) 52%, #000 38%))","boxShadow":"var(--lg-lift)"}}>
              <span style={{"position":"absolute","inset":"0","display":"flex","alignItems":"flex-end","padding":"16px","fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".16em","color":"rgba(255,255,255,.82)"}}>
                {"WAACK ON RADIO"}
              </span>
            </div>
            <div style={{"flex":"1","minWidth":"260px","display":"flex","flexDirection":"column","justifyContent":"center","gap":"14px"}}>
              <div>
                <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".18em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                  {v.podEpLabel}
                </div>
                <h2 style={{"margin":"8px 0 0","fontSize":"24px","fontWeight":"700","letterSpacing":"-0.01em","color":"var(--ink)","textWrap":"pretty"}}>
                  {v.podTitle}
                </h2>
                <p style={{"margin":"7px 0 0","fontSize":"13px","lineHeight":"1.55","color":"var(--ink-2)","textWrap":"pretty"}}>
                  {v.podGuest}
                </p>
              </div>
              <div onClick={v.podSeek} style={{"display":"flex","alignItems":"flex-end","gap":"2px","height":"56px","cursor":"pointer"}}>
                {(v.podBars ?? []).map((b: any, $index: number) => (
                  <Fragment key={$index}>
                    <span style={sty(b?.style)}></span>
                  </Fragment>
                ))}
              </div>
              <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)"}}>
                <span>
                  {v.podElapsed}
                </span>
                <span>
                  {v.podDuration}
                </span>
              </div>
              <div style={{"display":"flex","alignItems":"center","gap":"12px","flexWrap":"wrap"}}>
                <div onClick={v.podPrev} style={sty(v.podBtnGhost)} className={cx(pc("hover", "border-color:var(--purple)"))}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M19 5v14l-11-7z"></path>
                    <path d="M5 5v14"></path>
                  </svg>
                </div>
                <div onClick={v.podToggle} style={sty(v.podBtnMain)} className={cx(pc("hover", "transform:translateY(-1px)"))}>
                  {v.podPlaying && (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="5" width="4" height="14" rx="1.2"></rect>
                        <rect x="14" y="5" width="4" height="14" rx="1.2"></rect>
                      </svg>
                    </>
                  )}
                  {v.podPaused && (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5.2v13.6L19 12z"></path>
                      </svg>
                    </>
                  )}
                  {' '}
                  <span style={{"fontSize":"12px","fontWeight":"700","letterSpacing":".02em"}}>
                    {v.podBtnLabel}
                  </span>
                </div>
                <div onClick={v.podNext} style={sty(v.podBtnGhost)} className={cx(pc("hover", "border-color:var(--purple)"))}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M5 5v14l11-7z"></path>
                    <path d="M19 5v14"></path>
                  </svg>
                </div>
                <div onClick={v.podRate} style={sty(v.podBtnGhost)} className={cx(pc("hover", "border-color:var(--purple)"))}>
                  <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"11px","fontWeight":"700"}}>
                    {v.podRateLabel}
                  </span>
                </div>
                <div onClick={v.podBack15} style={sty(v.podBtnGhost)} className={cx(pc("hover", "border-color:var(--purple)"))}>
                  <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"11px","fontWeight":"700"}}>
                    {"−15s"}
                  </span>
                </div>
                <div onClick={v.podFwd15} style={sty(v.podBtnGhost)} className={cx(pc("hover", "border-color:var(--purple)"))}>
                  <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"11px","fontWeight":"700"}}>
                    {"+15s"}
                  </span>
                </div>
                <div style={{"display":"flex","alignItems":"center","gap":"10px","minWidth":"150px","flex":"1"}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" style={{"color":"var(--ink-3)"}}>
                    <path d="M11 5 6 9H3v6h3l5 4z"></path>
                    <path d="M16 9a4 4 0 010 6"></path>
                  </svg>
                  <input type="range" min="0" max="1" step="0.05" value={v.podVol} onChange={v.setPodVol} style={{"flex":"1","minWidth":"80px","accentColor":"var(--pink)"}} />
                </div>
              </div>
              <div style={{"display":"flex","gap":"10px","flexWrap":"wrap","paddingTop":"4px"}}>
                <div onClick={v.togglePodSleep} style={sty(v.podSleepBtn)}>
                  {v.podSleepLabel}
                </div>
                <div style={{"display":"inline-flex","alignItems":"center","gap":"8px","padding":"11px 17px","borderRadius":"999px","fontSize":"12px","fontWeight":"600","cursor":"pointer","border":"1px solid var(--hair)","background":"var(--glass-2)","color":"var(--ink-2)"}} className={cx(pc("hover", "color:var(--ink);border-color:var(--pink)"))}>
                  {"Guardar en cola"}
                </div>
                <div style={{"display":"inline-flex","alignItems":"center","gap":"8px","padding":"11px 17px","borderRadius":"999px","fontSize":"12px","fontWeight":"600","cursor":"pointer","border":"1px solid var(--hair)","background":"var(--glass-2)","color":"var(--ink-2)"}} className={cx(pc("hover", "color:var(--ink);border-color:var(--pink)"))}>
                  {"Compartir"}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{"display":"flex","flexDirection":"column","borderRadius":"26px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"blur(30px)","WebkitBackdropFilter":"blur(30px)","overflow":"hidden","boxShadow":"var(--lg-edge)"}}>
          <div style={{"padding":"16px 18px","borderBottom":"1px solid var(--hair-soft)"}}>
            <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".18em","color":"var(--ink-2)","textTransform":"uppercase"}}>
              {"Episodios"}
            </span>
          </div>
          <div style={{"display":"flex","flexDirection":"column"}}>
            {(v.podList ?? []).map((e: any, $index: number) => (
              <Fragment key={$index}>
                <div onClick={e?.onSelect} style={sty(e?.row)} className={cx(pc("hover", "background:var(--glass-2)"))}>
                  <span style={sty(e?.num)}>
                    {e?.n}
                  </span>
                  {' '}
                  <div style={{"flex":"1","minWidth":"0"}}>
                    <div style={{"fontSize":"13px","fontWeight":"700","color":"var(--ink)","textWrap":"pretty"}}>
                      {e?.title}
                    </div>
                    <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","marginTop":"4px"}}>
                      {e?.meta}
                    </div>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      <div style={{"display":"flex","flexWrap":"wrap","gap":"20px","alignItems":"stretch"}}>
        <div style={{"flex":"1 1 300px","minWidth":"0","padding":"22px 24px","borderRadius":"26px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"blur(30px)","WebkitBackdropFilter":"blur(30px)","boxShadow":"var(--lg-edge)"}}>
          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".18em","color":"var(--ink-3)","textTransform":"uppercase"}}>
            {"Capítulos"}
          </div>
          <div style={{"display":"flex","flexDirection":"column","gap":"2px","marginTop":"12px"}}>
            {(v.podChapterList ?? []).map((c: any, $index: number) => (
              <Fragment key={$index}>
                <div onClick={c?.go} style={sty(c?.row)} className={cx(pc("hover", "background:var(--glass-2)"))}>
                  <span style={sty(c?.num)}>
                    {c?.time}
                  </span>
                  {' '}
                  <span style={sty(c?.text)}>
                    {c?.label}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
        <div style={{"flex":"1 1 320px","minWidth":"0","padding":"22px 24px","borderRadius":"26px","border":"1px solid var(--hair)","background":"var(--glass-2)","backdropFilter":"blur(30px)","WebkitBackdropFilter":"blur(30px)","boxShadow":"var(--lg-edge)"}}>
          <div style={{"display":"flex","alignItems":"baseline","justifyContent":"space-between","gap":"12px","flexWrap":"wrap"}}>
            <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".18em","color":"var(--ink-3)","textTransform":"uppercase"}}>
              {"Transcripción"}
            </div>
            <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)"}}>
              {"Toca una línea para saltar"}
            </span>
          </div>
          <div style={{"display":"flex","flexDirection":"column","marginTop":"10px"}}>
            {(v.podLineList ?? []).map((l: any, $index: number) => (
              <Fragment key={$index}>
                <div onClick={l?.go} style={sty(l?.row)} className={cx(pc("hover", "opacity:1"))}>
                  <span style={sty(l?.name)}>
                    {l?.speaker}
                  </span>
                  {' '}
                  <div style={{"flex":"1","minWidth":"0"}}>
                    <p style={{"margin":"0","fontSize":"13px","lineHeight":"1.65","color":"var(--ink-2)","textWrap":"pretty"}}>
                      {l?.text}
                    </p>
                    {' '}
                    <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9.5px","color":"var(--ink-3)"}}>
                      {l?.time}
                    </span>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      <div style={{"borderRadius":"26px","border":"1px solid var(--hair)","background":"var(--glass-2)","backdropFilter":"blur(30px)","WebkitBackdropFilter":"blur(30px)","boxShadow":"var(--lg-edge)","padding":"24px 26px","maxWidth":"760px"}}>
        <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".18em","color":"var(--ink-3)","textTransform":"uppercase"}}>
          {"Notas del episodio"}
        </div>
        <p style={{"margin":"12px 0 0","fontSize":"13px","lineHeight":"1.7","color":"var(--ink-2)","textWrap":"pretty"}}>
          {v.podNotes}
        </p>
      </div>
    </div>
    </>
  );
}
