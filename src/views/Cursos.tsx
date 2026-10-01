// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function Cursos({ v }: { v: any }) {
  return (
    <>
    <div style={{"display":"flex","flexDirection":"column","gap":"26px","maxWidth":"1180px"}}>
      <div style={sty(v.statGrid)}>
        <div onClick={v.goRanking} style={sty(v.statCard1)} className={cx(pc("hover", "transform:perspective(1200px) translateZ(calc(26px * var(--z3d, 1))) rotateX(-3deg);border-color:color-mix(in oklch, var(--blue) 55%, transparent)"))}>
          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
            {"Puntos totales"}
          </div>
          <div style={{"marginTop":"10px","fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"38px","fontWeight":"400","letterSpacing":"-0.01em","color":"var(--ink)"}}>
            {"100"}
          </div>
        </div>
        <div onClick={v.goPerfil} style={sty(v.statCard2)} className={cx(pc("hover", "transform:perspective(1200px) translateZ(calc(26px * var(--z3d, 1))) rotateX(-3deg);border-color:color-mix(in oklch, var(--blue) 55%, transparent)"))}>
          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
            {"Racha"}
          </div>
          <div style={{"marginTop":"10px","fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"38px","fontWeight":"400","letterSpacing":"-0.01em","color":"var(--ink)"}}>
            {"4 días"}
          </div>
        </div>
        <div onClick={v.goPerfil} style={sty(v.statCard3)} className={cx(pc("hover", "transform:perspective(1200px) translateZ(calc(26px * var(--z3d, 1))) rotateX(-3deg);border-color:color-mix(in oklch, var(--blue) 55%, transparent)"))}>
          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
            {"Lecciones"}
          </div>
          <div style={{"marginTop":"10px","fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"38px","fontWeight":"400","letterSpacing":"-0.01em","color":"var(--ink)"}}>
            {"2 / 9"}
          </div>
        </div>
        <div onClick={v.goRanking} style={sty(v.statCard4)} className={cx(pc("hover", "transform:perspective(1200px) translateZ(calc(26px * var(--z3d, 1))) rotateX(-3deg);border-color:color-mix(in oklch, var(--blue) 55%, transparent)"))}>
          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
            {"Insignias"}
          </div>
          <div style={{"marginTop":"10px","fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"38px","fontWeight":"400","letterSpacing":"-0.01em","color":"var(--ink)"}}>
            {"6"}
          </div>
        </div>
      </div>
      <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(320px,1fr))","gap":"22px","alignItems":"start"}}>
        <div style={{"display":"flex","flexDirection":"column","gap":"14px"}}>
          <div style={{"display":"flex","alignItems":"baseline","justifyContent":"space-between","gap":"12px"}}>
            <h2 style={{"margin":"0","fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"22px","fontWeight":"400","letterSpacing":"0","color":"var(--ink)"}}>
              {"Transmisión de hoy"}
            </h2>
            <span onClick={v.goLives} style={{"fontSize":"12px","color":"var(--ink-2)","cursor":"pointer"}} className={cx(pc("hover", "color:var(--ink)"))}>
              {"Ver calendario"}
            </span>
          </div>
          <div style={{"borderRadius":"24px","overflow":"hidden","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)"}}>
            <div style={{"height":"190px","background":"linear-gradient(135deg, color-mix(in oklch, var(--pink) 55%, #000 22%), color-mix(in oklch, var(--purple) 60%, #000 28%))","position":"relative"}}>
              <span style={{"position":"absolute","top":"14px","left":"14px","display":"inline-flex","alignItems":"center","gap":"6px","padding":"6px 12px","borderRadius":"999px","background":"var(--pink)","color":"#fff","fontFamily":"'Geist Mono',monospace","fontSize":"9px","fontWeight":"700","letterSpacing":".14em"}}>
                <span style={{"width":"5px","height":"5px","borderRadius":"50%","background":"#fff","animation":"livePulse 1.2s ease-in-out infinite"}}></span>
                {"EN VIVO"}
              </span>
            </div>
            <div style={{"padding":"20px"}}>
              <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".16em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                {"Brando Hermoso · 128 BPM"}
              </div>
              <h3 style={{"margin":"8px 0","fontSize":"17px","fontWeight":"700","color":"var(--ink)"}}>
                {"Masterclass: Aceleración de Rolls & Técnica Disco"}
              </h3>
              <p style={{"margin":"0 0 18px","fontSize":"13px","lineHeight":"1.6","color":"var(--ink-2)","textWrap":"pretty"}}>
                {"Corrección postural en vivo, fijación de escápula y aceleración progresiva de rolls."}
              </p>
              <div onClick={v.goLives} style={{"display":"inline-flex","padding":"12px 22px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"#fff","background":"var(--pink)","boxShadow":"inset 0 1px 0 rgba(255,255,255,.35)","cursor":"pointer"}}>
                {"Entrar a la transmisión"}
              </div>
            </div>
          </div>
        </div>
        <div style={{"display":"flex","flexDirection":"column","gap":"14px"}}>
          <h2 style={{"margin":"0","fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"22px","fontWeight":"400","letterSpacing":"0","color":"var(--ink)"}}>
            {"Próximas en cartelera"}
          </h2>
          <div style={{"display":"flex","flexDirection":"column","gap":"10px"}}>
            <div onClick={v.goLives} style={sty(v.listCard)}>
              <div style={{"width":"44px","height":"44px","flex":"0 0 44px","borderRadius":"14px","background":"linear-gradient(135deg,var(--purple),var(--blue))"}}></div>
              <div style={{"minWidth":"0"}}>
                <div style={{"fontSize":"13px","fontWeight":"700","color":"var(--ink)"}}>
                  {"Ibuki Imata"}
                </div>
                <div style={{"fontSize":"12px","color":"var(--ink-2)","marginTop":"3px"}}>
                  {"Speed Drills & Sincronía · 135 BPM"}
                </div>
                <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","marginTop":"6px"}}>
                  {"Hoy · 21:00"}
                </div>
              </div>
            </div>
            <div onClick={v.goLives} style={sty(v.listCard)}>
              <div style={{"width":"44px","height":"44px","flex":"0 0 44px","borderRadius":"14px","background":"linear-gradient(135deg,var(--pink),var(--yellow))"}}></div>
              <div style={{"minWidth":"0"}}>
                <div style={{"fontSize":"13px","fontWeight":"700","color":"var(--ink)"}}>
                  {"Yoon Ji Kim"}
                </div>
                <div style={{"fontSize":"12px","color":"var(--ink-2)","marginTop":"3px"}}>
                  {"Análisis de Musicalidad K-Groove"}
                </div>
                <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","marginTop":"6px"}}>
                  {"Mañana · 19:30"}
                </div>
              </div>
            </div>
            <div onClick={v.goLives} style={sty(v.listCard)}>
              <div style={{"width":"44px","height":"44px","flex":"0 0 44px","borderRadius":"14px","background":"linear-gradient(135deg,var(--blue),var(--purple))"}}></div>
              <div style={{"minWidth":"0"}}>
                <div style={{"fontSize":"13px","fontWeight":"700","color":"var(--ink)"}}>
                  {"Lorena \"WaackQueen\""}
                </div>
                <div style={{"fontSize":"12px","color":"var(--ink-2)","marginTop":"3px"}}>
                  {"Posing & Geometría Espacial"}
                </div>
                <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","marginTop":"6px"}}>
                  {"Jueves · 20:00"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(300px,1fr))","gap":"22px","alignItems":"start"}}>
        <div style={{"display":"flex","flexDirection":"column","gap":"14px"}}>
          <div style={{"display":"flex","alignItems":"baseline","justifyContent":"space-between","gap":"12px"}}>
            <h2 style={{"margin":"0","fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"22px","fontWeight":"400","letterSpacing":"0","color":"var(--ink)"}}>
              {"Música de entrenamiento"}
            </h2>
            <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","whiteSpace":"nowrap"}}>
              {v.nowPlayingBpm}
            </span>
          </div>
          <div style={sty(v.plateRow)}>
            {(v.trackList ?? []).map((t: any, $index: number) => (
              <Fragment key={$index}>
                <div onClick={t?.open} style={sty(t?.card)} className={cx(pc("hover", "transform:perspective(1200px) translateZ(calc(22px * var(--z3d, 1))) rotateX(-3deg)"))}>
                  <span style={sty(t?.thumb)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"></path>
                    </svg>
                  </span>
                  {' '}
                  <div style={{"flex":"1","minWidth":"0"}}>
                    <div style={{"fontSize":"13px","fontWeight":"700","color":"var(--ink)","whiteSpace":"nowrap","overflow":"hidden","textOverflow":"ellipsis"}}>
                      {t?.title}
                    </div>
                    <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","marginTop":"4px"}}>
                      {t?.bpm}
                      {" · "}
                      {t?.tag}
                    </div>
                  </div>
                  {t?.isPlaying && (
                    <>
                      <span style={{"display":"inline-flex","alignItems":"center","gap":"5px","padding":"4px 10px","borderRadius":"999px","background":"var(--pink)","color":"#fff","fontFamily":"'Geist Mono',monospace","fontSize":"8px","fontWeight":"700","letterSpacing":".12em","whiteSpace":"nowrap"}}>
                        <span style={{"width":"4px","height":"4px","borderRadius":"50%","background":"#fff","animation":"livePulse 1.2s ease-in-out infinite"}}></span>
                        {"SUENA"}
                      </span>
                    </>
                  )}
                </div>
              </Fragment>
            ))}
          </div>
        </div>
        <div style={{"display":"flex","flexDirection":"column","gap":"14px"}}>
          <h2 style={{"margin":"0","fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"22px","fontWeight":"400","letterSpacing":"0","color":"var(--ink)"}}>
            {"Mi semana"}
          </h2>
          <div style={sty(v.statCard)}>
            <div style={{"display":"flex","alignItems":"flex-end","gap":"10px","height":"104px"}}>
              <div style={{"flex":"1","height":"38%","borderRadius":"8px 8px 3px 3px","background":"var(--blue)","opacity":".5"}}></div>
              <div style={{"flex":"1","height":"64%","borderRadius":"8px 8px 3px 3px","background":"var(--blue)","opacity":".65"}}></div>
              <div style={{"flex":"1","height":"22%","borderRadius":"8px 8px 3px 3px","background":"var(--blue)","opacity":".4"}}></div>
              <div style={{"flex":"1","height":"82%","borderRadius":"8px 8px 3px 3px","background":"var(--blue)"}}></div>
              <div style={{"flex":"1","height":"54%","borderRadius":"8px 8px 3px 3px","background":"var(--blue)","opacity":".6"}}></div>
              <div style={{"flex":"1","height":"12%","borderRadius":"8px 8px 3px 3px","background":"var(--hair)"}}></div>
              <div style={{"flex":"1","height":"12%","borderRadius":"8px 8px 3px 3px","background":"var(--hair)"}}></div>
            </div>
            <div style={{"display":"flex","justifyContent":"space-between","marginTop":"12px","fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".1em","color":"var(--ink-3)"}}>
              <span>
                {"L"}
              </span>
              <span>
                {"M"}
              </span>
              <span>
                {"X"}
              </span>
              <span>
                {"J"}
              </span>
              <span>
                {"V"}
              </span>
              <span>
                {"S"}
              </span>
              <span>
                {"D"}
              </span>
            </div>
            <div style={{"marginTop":"16px","paddingTop":"14px","borderTop":"1px solid var(--hair-soft)","display":"flex","alignItems":"baseline","gap":"8px"}}>
              <span style={{"fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"31px","fontWeight":"400","letterSpacing":"-0.01em","color":"var(--ink)"}}>
                {"3 h 40 m"}
              </span>
              <span style={{"fontSize":"12px","color":"var(--ink-2)"}}>
                {"de práctica esta semana"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div style={{"display":"flex","flexDirection":"column","gap":"18px","paddingTop":"8px","borderTop":"1px solid var(--hair-soft)"}}>
        <div style={{"display":"flex","alignItems":"flex-end","justifyContent":"space-between","gap":"18px","flexWrap":"wrap"}}>
          <div>
            <div id="novedades" style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".22em","color":"var(--purple)","fontWeight":"700","textTransform":"uppercase","scrollMarginTop":"24px"}}>
              {"Anuncios"}
            </div>
            <h2 style={{"margin":"10px 0 8px","fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"31px","fontWeight":"400","letterSpacing":"-0.01em","color":"var(--ink)"}}>
              {"Novedades & convocatorias"}
            </h2>
            <p style={{"margin":"0","fontSize":"13px","color":"var(--ink-2)","maxWidth":"520px","textWrap":"pretty"}}>
              {"Competencias, sesiones de entrenamiento, clases especiales y comunicados publicados por el equipo docente."}
            </p>
          </div>
          <div onClick={v.onAnnBadgeClick} style={sty(v.annBadgeStyle)} className={cx(pc("hover", "color:var(--ink);border-color:var(--purple)"))}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 11l16-6-6 16-2-8z"></path>
            </svg>
            {" "}
            {v.annBadgeLabel}
            {" "}
          </div>
        </div>
        <div style={{"display":"flex","alignItems":"center","gap":"9px","flexWrap":"wrap"}}>
          {(v.annTabs ?? []).map((a: any, $index: number) => (
            <Fragment key={$index}>
              <div onClick={a?.pick} style={sty(a?.style)}>
                <span>
                  {a?.label}
                </span>
                {' '}
                <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","opacity":".75"}}>
                  {a?.count}
                </span>
              </div>
            </Fragment>
          ))}
        </div>
        {v.annCreateOpen && (
          <>
            <div style={{"borderRadius":"22px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)","padding":"20px","display":"flex","flexDirection":"column","gap":"12px"}}>
              <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ink)"}}>
                {"Publicar un anuncio"}
              </div>
              <div style={{"display":"flex","gap":"8px","flexWrap":"wrap"}}>
                {(v.annCatPicker ?? []).map((c: any, $index: number) => (
                  <Fragment key={$index}>
                    <div onClick={c?.pick} style={sty(c?.style)}>
                      {c?.label}
                    </div>
                  </Fragment>
                ))}
              </div>
              <input value={v.annTitleValue} onChange={v.annTitleChange} placeholder="Título del anuncio" style={{"width":"100%","boxSizing":"border-box","padding":"11px 14px","borderRadius":"14px","border":"1px solid var(--hair)","background":"var(--glass-2)","color":"var(--ink)","fontSize":"13px","outline":"none"}} />
              <textarea value={v.annBodyValue} onChange={v.annBodyChange} placeholder="Describe el anuncio…" rows="3" style={{"width":"100%","boxSizing":"border-box","padding":"11px 14px","borderRadius":"14px","border":"1px solid var(--hair)","background":"var(--glass-2)","color":"var(--ink)","fontFamily":"inherit","fontSize":"13px","outline":"none","resize":"vertical"}}></textarea>
              <input id="ann-image-input" type="file" accept="image/*" onChange={v.annOnImage} style={{"display":"none"}} />
              <div onClick={v.annPickImage} style={{"padding":"12px 14px","borderRadius":"14px","border":"1px dashed var(--hair)","textAlign":"center","color":"var(--ink-2)","fontSize":"12.5px","cursor":"pointer"}}>
                {v.annImageLabel}
              </div>
              {v.annErr && (
                <>
                  <div style={{"fontSize":"11.5px","color":"var(--pink)"}}>
                    {v.annErr}
                  </div>
                </>
              )}
              <div style={{"display":"flex","gap":"10px"}}>
                <div onClick={v.annCancelCreate} style={{"flex":"1","textAlign":"center","padding":"12px","borderRadius":"999px","fontSize":"12.5px","fontWeight":"700","color":"var(--ink-2)","border":"1px solid var(--hair)","cursor":"pointer"}}>
                  {"Cancelar"}
                </div>
                <div onClick={v.annSubmit} style={{"flex":"1","textAlign":"center","padding":"12px","borderRadius":"999px","fontSize":"12.5px","fontWeight":"700","color":"#1A1400","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","cursor":"pointer"}}>
                  {v.annSubmitLabel}
                </div>
              </div>
            </div>
          </>
        )}
        <div style={sty(v.cardGrid)}>
          {(v.annCards ?? []).map((a: any, $index: number) => (
            <Fragment key={$index}>
              <div style={sty(a?.card)} className={cx(pc("hover", "transform:perspective(1200px) translateZ(calc(28px * var(--z3d, 1))) rotateX(-3deg);border-color:color-mix(in oklch, var(--purple) 55%, transparent)"))}>
                <div style={{"display":"flex","alignItems":"center","gap":"11px","padding":"15px 16px 13px"}}>
                  <span style={sty(a?.avatar)}></span>
                  <div style={{"flex":"1","minWidth":"0"}}>
                    <div style={{"fontSize":"13px","fontWeight":"700","color":"var(--ink)","whiteSpace":"nowrap","overflow":"hidden","textOverflow":"ellipsis"}}>
                      {a?.author}
                    </div>
                    <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".16em","color":"var(--ink-3)","textTransform":"uppercase","marginTop":"4px"}}>
                      {a?.role}
                    </div>
                  </div>
                  {a?.isPinned && (
                    <>
                      <span style={{"padding":"4px 10px","borderRadius":"999px","background":"var(--purple)","color":"#fff","fontFamily":"'Geist Mono',monospace","fontSize":"8px","fontWeight":"700","letterSpacing":".12em","whiteSpace":"nowrap"}}>
                        {"FIJADO"}
                      </span>
                    </>
                  )}
                </div>
                <div style={sty(a?.cover)}></div>
                <div style={{"padding":"14px 16px 0"}}>
                  <h3 style={{"margin":"0 0 8px","fontSize":"15px","fontWeight":"700","color":"var(--ink)","textWrap":"pretty"}}>
                    {a?.title}
                  </h3>
                  <p style={{"margin":"0 0 14px","fontSize":"13px","lineHeight":"1.6","color":"var(--ink-2)","textWrap":"pretty"}}>
                    {a?.body}
                  </p>
                </div>
                <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"12px","padding":"14px 16px"}}>
                  <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","whiteSpace":"nowrap"}}>
                    {a?.date}
                  </span>
                  <span onClick={a?.go} style={{"display":"inline-flex","alignItems":"center","gap":"7px","padding":"10px 17px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"#1A1400","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","boxShadow":"inset 0 1px 0 rgba(255,255,255,.5)","cursor":"pointer","whiteSpace":"nowrap"}}>
                    {a?.cta}
                  </span>
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
