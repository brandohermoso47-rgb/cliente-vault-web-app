// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';
import EntrenarEstilos from './EntrenarEstilos';

export default function Lab({ v }: { v: any }) {
  return (
    <>
    <div style={{"display":"flex","flexDirection":"column","gap":"26px","maxWidth":"1180px"}}>
      <div style={{"display":"flex","flexWrap":"wrap","gap":"22px","alignItems":"stretch"}}>
        <div style={{"flex":"3 1 460px","minWidth":"0","display":"flex","flexDirection":"column","gap":"14px"}}>
          <div style={{"borderRadius":"26px","overflow":"hidden","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)"}}>
            <div style={{"position":"relative","aspectRatio":"16/9","background":"repeating-linear-gradient(118deg, color-mix(in oklch, var(--ink) 9%, transparent) 0 6px, transparent 6px 18px), linear-gradient(160deg, color-mix(in oklch, var(--purple) 22%, transparent), color-mix(in oklch, var(--ground) 92%, transparent))"}}>
              <div style={sty(v.labGridOverlay)}></div>
              <div style={{"position":"absolute","left":"50%","top":"0","bottom":"0","width":"1px","borderLeft":"1px dashed color-mix(in oklch, var(--pink) 60%, transparent)","pointerEvents":"none"}}></div>
              <div style={{"position":"absolute","left":"50%","top":"50%","width":"132px","height":"132px","transform":"translate(-50%,-50%)","borderRadius":"50%","border":"1px dashed color-mix(in oklch, var(--yellow) 45%, transparent)","pointerEvents":"none"}}></div>
              <div style={{"position":"absolute","inset":"16px 18px auto","display":"flex","alignItems":"center","justifyContent":"space-between","gap":"12px","flexWrap":"wrap"}}>
                <div style={{"display":"flex","gap":"8px","flexWrap":"wrap"}}>
                  <span style={{"padding":"6px 12px","borderRadius":"999px","fontFamily":"'Geist Mono',monospace","fontSize":"9.5px","letterSpacing":".14em","color":"var(--ink-2)","background":"color-mix(in oklch, var(--ground) 62%, transparent)","border":"1px solid var(--hair)"}}>
                    {"MIRROR_FEED"}
                  </span>
                  <span style={{"padding":"6px 12px","borderRadius":"999px","fontFamily":"'Geist Mono',monospace","fontSize":"9.5px","letterSpacing":".14em","color":"var(--yellow)","background":"color-mix(in oklch, var(--ground) 62%, transparent)","border":"1px solid var(--hair)"}}>
                    {v.labBpmLabel}
                  </span>
                </div>
                <div style={sty(v.labStageRec)}>
                  <span style={sty(v.labRecDot)}></span>
                  {"REC "}
                  {v.labTakeName}
                </div>
              </div>
              <div style={{"position":"absolute","inset":"auto 18px 16px","display":"flex","alignItems":"flex-end","justifyContent":"space-between","gap":"14px","flexWrap":"wrap"}}>
                <div style={{"display":"flex","flexDirection":"column","gap":"8px"}}>
                  <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".16em","color":"var(--ink-3)"}}>
                    {"DRILL EN CURSO"}
                  </span>
                  <span style={{"fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"26px","color":"var(--ink)"}}>
                    {v.labTakeDrill}
                  </span>
                </div>
                <div style={{"display":"flex","alignItems":"center","gap":"6px"}}>
                  <span style={{"width":"7px","height":"7px","borderRadius":"50%","background":"var(--yellow)"}}></span>
                  <span style={{"width":"7px","height":"7px","borderRadius":"50%","background":"color-mix(in oklch, var(--yellow) 40%, transparent)"}}></span>
                  <span style={{"width":"7px","height":"7px","borderRadius":"50%","background":"color-mix(in oklch, var(--yellow) 40%, transparent)"}}></span>
                  <span style={{"width":"7px","height":"7px","borderRadius":"50%","background":"color-mix(in oklch, var(--yellow) 40%, transparent)"}}></span>
                  <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","marginLeft":"8px"}}>
                    {"00:42 / 02:30"}
                  </span>
                </div>
              </div>
            </div>
            <div style={{"display":"flex","flexWrap":"wrap","gap":"10px","padding":"16px 18px","borderTop":"1px solid var(--hair-soft)"}}>
              <div onClick={v.toggleRec} style={sty(v.labRecBtn)}>
                <span style={{"width":"9px","height":"9px","borderRadius":"50%","background":"#fff"}}></span>
                {v.labRecLabel}
              </div>
              <div onClick={v.toggleMirror} style={sty(v.labMirrorBtn)}>
                {"Espejo"}
              </div>
              <div onClick={v.toggleGrid} style={sty(v.labGridBtn)}>
                {"Grid 9×9"}
              </div>
              <div style={{"display":"inline-flex","alignItems":"center","gap":"8px","padding":"11px 18px","borderRadius":"999px","fontSize":"12px","fontWeight":"600","cursor":"pointer","border":"1px solid var(--hair)","background":"var(--glass-2)","color":"var(--ink-2)"}} className={cx(pc("hover", "color:var(--ink);border-color:var(--yellow)"))}>
                {"Capturar frame"}
              </div>
            </div>
          </div>
          <div style={{"padding":"20px 22px","borderRadius":"22px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)"}}>
            <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
              {"Timeline de la sesión"}
            </div>
            <div style={{"display":"flex","height":"9px","margin":"16px 0 12px","borderRadius":"999px","overflow":"hidden","background":"var(--hair)"}}>
              {(v.labTimeline ?? []).map((t: any, $index: number) => (
                <Fragment key={$index}>
                  <div style={sty(t?.bar)}></div>
                </Fragment>
              ))}
            </div>
            <div style={{"display":"flex"}}>
              {(v.labTimeline ?? []).map((t: any, $index: number) => (
                <Fragment key={$index}>
                  <div style={sty(t?.col)}>
                    <span style={{"fontSize":"11.5px","fontWeight":"600","color":"var(--ink-2)","whiteSpace":"nowrap","overflow":"hidden","textOverflow":"ellipsis"}}>
                      {t?.label}
                    </span>
                    {' '}
                    <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9.5px","color":"var(--ink-3)"}}>
                      {t?.meta}
                    </span>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
        <div style={{"flex":"1 1 260px","minWidth":"0","display":"flex","flexDirection":"column","gap":"14px"}}>
          <div style={{"display":"flex","flexDirection":"column","gap":"12px","padding":"20px 22px","borderRadius":"22px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)"}}>
            <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
              {"Playlist del laboratorio"}
            </div>
            {(v.trackList ?? []).map((t: any, $index: number) => (
              <Fragment key={$index}>
                <div onClick={t?.play} style={{"display":"flex","alignItems":"center","gap":"12px","padding":"10px","borderRadius":"16px","cursor":"pointer","border":"1px solid var(--hair)","background":"var(--glass-2)"}} className={cx(pc("hover", "border-color:var(--purple)"))}>
                  <span style={sty(t?.thumb)}></span>
                  <div style={{"flex":"1","minWidth":"0"}}>
                    <div style={{"fontSize":"12.5px","fontWeight":"700","color":"var(--ink)","whiteSpace":"nowrap","overflow":"hidden","textOverflow":"ellipsis"}}>
                      {t?.title}
                    </div>
                    <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9.5px","color":"var(--ink-3)","marginTop":"3px"}}>
                      {t?.bpm}
                    </div>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(300px,1fr))","gap":"22px","alignItems":"start"}}>
        <div style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"22px","padding":"34px 26px","borderRadius":"26px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)","animation":"goldEdge 4.5s ease-in-out infinite"}}>
          <div style={sty(v.metroDot)}></div>
          <div style={{"fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"38px","color":"var(--ink)"}}>
            {v.labBpmLabel}
          </div>
          <input type="range" min="80" max="150" step="1" value={v.labBpm} onChange={v.setBpm} style={{"width":"100%","accentColor":"var(--blue)"}} />
          <div onClick={v.toggleMetro} style={{"width":"100%","textAlign":"center","padding":"14px 20px","borderRadius":"999px","fontSize":"13px","fontWeight":"700","color":"#1A1400","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","boxShadow":"inset 0 1px 0 rgba(255,255,255,.5)","cursor":"pointer"}}>
            {v.metroLabel}
          </div>
        </div>
        <div style={{"display":"flex","flexDirection":"column","gap":"12px"}}>
          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
            {"Drills de la sesión"}
          </div>
          <div style={sty(v.plateRow)}>
            {(v.drills ?? []).map((d: any, $index: number) => (
              <Fragment key={$index}>
                <div onClick={d?.pick} style={sty(d?.card)} className={cx(pc("hover", "transform:perspective(1200px) translateZ(calc(22px * var(--z3d, 1))) rotateX(-3deg)"))}>
                  <span style={sty(d?.dot)}></span>
                  {' '}
                  <div style={{"flex":"1","minWidth":"0"}}>
                    <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ink)"}}>
                      {d?.title}
                    </div>
                    <div style={{"fontSize":"12.5px","color":"var(--ink-2)","marginTop":"4px","textWrap":"pretty"}}>
                      {d?.desc}
                    </div>
                  </div>
                  {' '}
                  <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"11px","color":"var(--ink-3)","whiteSpace":"nowrap"}}>
                    {d?.secs}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      <div style={{"display":"flex","flexDirection":"column","gap":"12px"}}>
        <div style={{"display":"flex","alignItems":"baseline","justifyContent":"space-between","gap":"12px","flexWrap":"wrap"}}>
          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
            {"Galería de takes"}
          </div>
          <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)"}}>
            {"Se guardan 7 días · exporta lo que quieras conservar"}
          </span>
        </div>
        <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fill,minmax(220px,1fr))","gap":"16px"}}>
          {(v.labTakes ?? []).map((k: any, $index: number) => (
            <Fragment key={$index}>
              <div onClick={k?.pick} style={sty(k?.card)} className={cx(pc("hover", "transform:translateY(-3px)"))}>
                <div style={sty(k?.thumb)}></div>
                <div>
                  <div style={{"display":"flex","alignItems":"baseline","justifyContent":"space-between","gap":"10px"}}>
                    <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".14em","color":"var(--yellow)"}}>
                      {k?.name}
                    </span>
                  </div>
                  <div style={{"fontSize":"13.5px","fontWeight":"700","color":"var(--ink)","marginTop":"6px"}}>
                    {k?.drill}
                  </div>
                  <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9.5px","color":"var(--ink-3)","marginTop":"5px"}}>
                    {k?.meta}
                  </div>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
      <div style={{"display":"flex","flexWrap":"wrap","gap":"22px","alignItems":"stretch"}}>
        <div style={{"flex":"3 1 460px","minWidth":"0","display":"flex","flexDirection":"column","gap":"14px","padding":"22px","borderRadius":"26px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)"}}>
          <div style={{"display":"flex","alignItems":"baseline","justifyContent":"space-between","gap":"12px","flexWrap":"wrap"}}>
            <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
              {"Frame annotator"}
            </div>
            <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)"}}>
              {v.labTakeName}
              {" · "}
              {v.labFrameTag}
              {" · "}
              {v.labFrameTime}
            </span>
          </div>
          <div style={{"position":"relative","aspectRatio":"16/9","borderRadius":"18px","overflow":"hidden","background":"repeating-linear-gradient(115deg, color-mix(in oklch, var(--ink) 10%, transparent) 0 5px, transparent 5px 15px), var(--glass-2)"}}>
            <div style={{"position":"absolute","left":"50%","top":"0","bottom":"0","width":"1px","borderLeft":"1px dashed color-mix(in oklch, var(--pink) 55%, transparent)"}}></div>
            <div style={{"position":"absolute","left":"50%","top":"44%","width":"118px","height":"118px","transform":"translate(-50%,-50%)","borderRadius":"50%","border":"1px dashed color-mix(in oklch, var(--yellow) 50%, transparent)"}}></div>
            <div style={{"position":"absolute","left":"14px","bottom":"14px","fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".14em","color":"var(--ink-3)"}}>
              {"DROP: FRAME DEL TAKE"}
            </div>
            <div style={{"position":"absolute","right":"14px","top":"14px","padding":"6px 11px","borderRadius":"9px","background":"color-mix(in oklch, var(--ground) 70%, transparent)","border":"1px solid var(--hair)","fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--yellow)"}}>
              {"ELBOW_EXT 164.2°"}
            </div>
          </div>
          <div style={{"display":"flex","gap":"10px","overflowX":"auto","paddingBottom":"4px"}}>
            {(v.labFrames ?? []).map((f: any, $index: number) => (
              <Fragment key={$index}>
                <div onClick={f?.pick} style={sty(f?.style)}>
                  <div style={sty(f?.thumb)}></div>
                  {' '}
                  <span style={sty(f?.label)}>
                    {f?.tag}
                  </span>
                  {' '}
                  <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"8.5px","color":"var(--ink-3)"}}>
                    {f?.time}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
          <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(130px,1fr))","gap":"12px"}}>
            {(v.labMetrics ?? []).map((m: any, $index: number) => (
              <Fragment key={$index}>
                <div style={{"padding":"14px 16px","borderRadius":"16px","border":"1px solid var(--hair)","background":"var(--glass-2)"}}>
                  <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"8.5px","letterSpacing":".16em","color":"var(--ink-3)"}}>
                    {m?.kicker}
                  </div>
                  <div style={{"fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"27px","color":"var(--yellow)","marginTop":"6px"}}>
                    {m?.value}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
          <div style={{"display":"flex","flexDirection":"column","gap":"8px"}}>
            <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
              {"Sensación interna"}
            </div>
            <textarea value={v.labNote} onChange={v.onLabNote} placeholder="Describe qué sentiste en este frame…" rows="3" style={{"width":"100%","boxSizing":"border-box","padding":"14px 16px","borderRadius":"18px","border":"1px solid var(--hair)","background":"var(--glass-2)","fontFamily":"Geist,sans-serif","fontSize":"13.5px","lineHeight":"1.6","color":"var(--ink)","outline":"none","resize":"vertical"}} className={cx(pc("focus", "border-color:var(--yellow)"))}></textarea>
            <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"12px","flexWrap":"wrap"}}>
              <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)"}}>
                {v.labNoteCount}
              </span>
              <div style={{"display":"flex","gap":"10px","flexWrap":"wrap"}}>
                <span style={{"padding":"11px 18px","borderRadius":"999px","fontSize":"12px","fontWeight":"600","color":"var(--ink-2)","border":"1px solid var(--hair)","background":"var(--glass-2)","cursor":"pointer"}} className={cx(pc("hover", "color:var(--ink)"))}>
                  {"Exportar frame"}
                </span>
                <span style={{"padding":"11px 20px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"#1A1400","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","boxShadow":"inset 0 1px 0 rgba(255,255,255,.5)","cursor":"pointer"}}>
                  {"Guardar en Somatic Diary"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div style={{"flex":"1 1 280px","minWidth":"0","display":"flex","flexDirection":"column","gap":"12px"}}>
          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
            {"AI coaching · "}
            {v.labTakeDrill}
          </div>
          {(v.labCoach ?? []).map((c: any, $index: number) => (
            <Fragment key={$index}>
              <div style={sty(c?.card)}>
                <div style={{"display":"flex","alignItems":"baseline","justifyContent":"space-between","gap":"10px"}}>
                  <span style={{"fontSize":"14px","fontWeight":"700","color":"var(--ink)","textWrap":"pretty"}}>
                    {c?.title}
                  </span>
                  {c?.hasTag && (
                    <>
                      <span style={sty(c?.chip)}>
                        {c?.tag}
                      </span>
                    </>
                  )}
                </div>
                <p style={{"margin":"9px 0 0","fontSize":"13px","lineHeight":"1.6","color":"var(--ink-2)","textWrap":"pretty"}}>
                  {c?.desc}
                </p>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
      <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(200px,1fr))","gap":"16px"}}>
        {(v.labStatCards ?? []).map((s: any, $index: number) => (
          <Fragment key={$index}>
            <div style={sty(s?.card)}>
              <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"8.5px","letterSpacing":".18em","color":"var(--ink-3)"}}>
                {s?.kicker}
              </div>
              <div style={{"fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"34px","color":"var(--ink)","marginTop":"8px"}}>
                {s?.value}
              </div>
              <div style={{"fontSize":"12.5px","color":"var(--ink-2)","marginTop":"6px","textWrap":"pretty"}}>
                {s?.desc}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
      <EntrenarEstilos />
    </div>
    </>
  );
}
