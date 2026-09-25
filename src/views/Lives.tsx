// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function Lives({ v }: { v: any }) {
  return (
    <>
    <div style={{"display":"flex","flexDirection":"column","gap":"24px","maxWidth":"1180px"}}>
      <div style={{"display":"flex","alignItems":"flex-end","justifyContent":"space-between","gap":"20px","flexWrap":"wrap"}}>
        <div style={{"display":"flex","gap":"8px","flexWrap":"wrap"}}>
          <div style={sty(v.chipLive)}>
            {"Sala principal"}
          </div>
          <div style={sty(v.chipOff)} className={cx(pc("hover", v.chipHover3d))}>
            {"Practice Room"}
          </div>
          <div onClick={v.onBattleChip} style={sty(v.battleChipStyle)} className={cx(pc("hover", v.chipHover3d))}>
            {"Batallas"}
          </div>
        </div>
      </div>
      <div style={{"display":"flex","flexDirection":"column","gap":"14px","padding":"22px","borderRadius":"24px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"blur(30px)"}}>
        <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".18em","color":"var(--ink-3)","textTransform":"uppercase"}}>
          {"Próximas clases"}
        </div>
        {v.evHasUpcoming && (
          <>
            <div style={{"display":"flex","flexDirection":"column","gap":"10px"}}>
              {(v.evUpcomingList ?? []).map((ev: any, $index: number) => (
                <Fragment key={$index}>
                  <div style={{"display":"flex","alignItems":"center","gap":"12px","flexWrap":"wrap","padding":"14px 16px","borderRadius":"16px","border":"1px solid var(--hair)","background":"var(--glass-2)"}}>
                    <div style={{"flex":"1","minWidth":"200px"}}>
                      <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ink)"}}>
                        {ev?.title}
                      </div>
                      <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","marginTop":"4px"}}>
                        {ev?.when}
                        {" · "}
                        {ev?.author}
                      </div>
                      <div style={{"fontSize":"12px","color":"var(--ink-2)","marginTop":"4px"}}>
                        {ev?.desc}
                      </div>
                    </div>
                    <div onClick={ev?.ics} style={{"padding":"9px 14px","borderRadius":"999px","fontSize":"11.5px","fontWeight":"700","color":"var(--ink)","border":"1px solid var(--hair)","background":"var(--glass-2)","cursor":"pointer"}}>
                      {"Agregar a mi calendario"}
                    </div>
                    <div onClick={ev?.gcal} style={{"padding":"9px 14px","borderRadius":"999px","fontSize":"11.5px","fontWeight":"700","color":"var(--ink)","border":"1px solid var(--hair)","background":"var(--glass-2)","cursor":"pointer"}}>
                      {"Google Calendar"}
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>
          </>
        )}
        {!v.evHasUpcoming && (
          <>
            <div style={{"fontSize":"12.5px","color":"var(--ink-3)"}}>
              {"Todavía no hay clases programadas."}
            </div>
          </>
        )}
      </div>
      <div style={{"display":"flex","flexDirection":"column","gap":"14px","padding":"22px","borderRadius":"24px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"blur(30px)"}}>
        <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"12px","flexWrap":"wrap"}}>
          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".18em","color":"var(--ink-3)","textTransform":"uppercase"}}>
            {"Transmitir en vivo"}
          </div>
          <div onClick={v.liveToggle} style={sty(v.liveToggleStyle)}>
            {v.liveToggleLabel}
          </div>
        </div>
        {v.liveErr && (
          <>
            <div style={{"padding":"10px 14px","borderRadius":"12px","background":"color-mix(in oklch, var(--pink) 14%, transparent)","color":"var(--pink)","fontSize":"12px"}}>
              {v.liveErr}
            </div>
          </>
        )}
        {v.liveOn && (
          <>
            <div style={{"position":"relative","aspectRatio":"16/9","maxWidth":"640px","borderRadius":"18px","overflow":"hidden","background":"#000"}}>
              <video ref={v.setLivePreviewEl} autoPlay="" muted="" playsInline="" style={{"width":"100%","height":"100%","objectFit":"cover","transform":"scaleX(-1)"}}></video>
              {' '}
              <span style={{"position":"absolute","top":"10px","left":"10px","padding":"4px 10px","borderRadius":"999px","background":"var(--pink)","color":"#fff","fontFamily":"'Geist Mono',monospace","fontSize":"9px","fontWeight":"700","letterSpacing":".12em"}}>
                {"EN VIVO"}
              </span>
            </div>
            <div style={{"fontSize":"12px","color":"var(--ink-3)"}}>
              {v.liveViewersLabel}
            </div>
            <div style={{"display":"flex","alignItems":"center","gap":"8px","flexWrap":"wrap"}}>
              {v.ccSupported && (
                <>
                  <div onClick={v.ccToggle} style={{"padding":"9px 16px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"var(--ink)","border":"1px solid var(--hair)","background":"var(--glass-2)","cursor":"pointer"}}>
                    {v.ccToggleLabel}
                  </div>
                </>
              )}
              {(v.ccLangs ?? []).map((cl: any, $index: number) => (
                <Fragment key={$index}>
                  <span onClick={cl?.pick} style={sty(cl?.style)}>
                    {cl?.label}
                  </span>
                </Fragment>
              ))}
            </div>
            <div style={{"fontSize":"11.5px","color":"var(--ink-3)"}}>
              {"Elige el idioma en el que hablas. Tus espectadores verán los subtítulos y podrán traducirlos."}
            </div>
          </>
        )}
        {!v.liveOn && (
          <>
            <div style={{"fontSize":"12.5px","lineHeight":"1.6","color":"var(--ink-2)","maxWidth":"560px"}}>
              {"Enciende tu cámara y micrófono para transmitir. Cualquier usuario puede ver tu transmisión desde esta pantalla. Tu navegador te pedirá permiso."}
            </div>
          </>
        )}
      </div>
      <div style={{"display":"flex","flexDirection":"column","gap":"14px","padding":"22px","borderRadius":"24px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"blur(30px)"}}>
        <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".18em","color":"var(--ink-3)","textTransform":"uppercase"}}>
          {"En vivo ahora"}
        </div>
        {v.liveIsWatching && (
          <>
            <div style={{"position":"relative","aspectRatio":"16/9","maxWidth":"760px","borderRadius":"18px","overflow":"hidden","background":"#000"}}>
              <video ref={v.setLiveWatchEl} autoPlay="" playsInline="" style={{"width":"100%","height":"100%","objectFit":"contain"}}></video>
              {' '}
              <span style={{"position":"absolute","top":"10px","left":"10px","padding":"4px 10px","borderRadius":"999px","background":"var(--pink)","color":"#fff","fontFamily":"'Geist Mono',monospace","fontSize":"9px","fontWeight":"700","letterSpacing":".12em"}}>
                {v.liveWatchStatus}
              </span>
              {' '}
              <span style={{"position":"absolute","top":"10px","right":"10px","padding":"4px 10px","borderRadius":"999px","background":"rgba(0,0,0,.55)","color":"#fff","fontSize":"11px"}}>
                {v.liveWatchName}
              </span>
              {' '}
              {v.ccHasText && (
                <>
                  <div style={{"position":"absolute","left":"0","right":"0","bottom":"14px","textAlign":"center","padding":"0 16px"}}>
                    <span style={{"display":"inline-block","maxWidth":"92%","padding":"6px 12px","borderRadius":"10px","background":"rgba(0,0,0,.72)","color":"#fff","fontSize":"15px","lineHeight":"1.4"}}>
                      {v.ccText}
                    </span>
                  </div>
                </>
              )}
            </div>
            <div style={{"display":"flex","alignItems":"center","gap":"8px","flexWrap":"wrap"}}>
              <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".14em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                {"Ver subtítulos en"}
              </span>
              {(v.ccTargets ?? []).map((ct: any, $index: number) => (
                <Fragment key={$index}>
                  <span onClick={ct?.pick} style={sty(ct?.style)}>
                    {ct?.label}
                  </span>
                </Fragment>
              ))}
            </div>
            <div style={{"fontSize":"11px","color":"var(--ink-3)"}}>
              {v.ccTranslateNote}
            </div>
            <div onClick={v.liveLeave} style={{"alignSelf":"flex-start","padding":"10px 18px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"var(--ink)","border":"1px solid var(--hair)","background":"var(--glass-2)","cursor":"pointer"}}>
              {"Dejar de ver"}
            </div>
          </>
        )}
        {v.liveHasList && (
          <>
            <div style={{"display":"flex","flexDirection":"column","gap":"8px"}}>
              {(v.liveList ?? []).map((lv: any, $index: number) => (
                <Fragment key={$index}>
                  <div onClick={lv?.watch} style={{"display":"flex","alignItems":"center","gap":"12px","padding":"12px 16px","borderRadius":"14px","border":"1px solid var(--hair)","background":"var(--glass-2)","cursor":"pointer"}} className={cx(pc("hover", "border-color:var(--pink)"))}>
                    <span style={{"width":"8px","height":"8px","borderRadius":"50%","background":"var(--pink)"}}></span>
                    <span style={{"flex":"1","fontSize":"13px","color":"var(--ink)"}}>
                      {lv?.name}
                    </span>
                    <span style={{"fontSize":"11.5px","color":"var(--pink)","fontWeight":"700"}}>
                      {"Ver"}
                    </span>
                  </div>
                </Fragment>
              ))}
            </div>
          </>
        )}
        {!v.liveHasList && (
          <>
            <div style={{"fontSize":"12.5px","color":"var(--ink-3)"}}>
              {"Nadie está transmitiendo ahora mismo."}
            </div>
          </>
        )}
      </div>
      {v.battlePanelOpen && (
        <>
          <div style={{"borderRadius":"24px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"blur(30px)","padding":"22px"}}>
            <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".18em","color":"var(--ink-3)","textTransform":"uppercase"}}>
              {"Battle Training"}
            </div>
            {v.battleErr && (
              <>
                <div style={{"marginTop":"12px","padding":"10px 14px","borderRadius":"12px","background":"color-mix(in oklch, var(--pink) 14%, transparent)","color":"var(--pink)","fontSize":"12px"}}>
                  {v.battleErr}
                </div>
              </>
            )}
            {v.battleIncomingCalls && (
              <>
                {(v.battleIncomingCalls ?? []).map((ic: any, $index: number) => (
                  <Fragment key={$index}>
                    <div style={{"marginTop":"14px","display":"flex","alignItems":"center","gap":"12px","padding":"12px 16px","borderRadius":"16px","background":"color-mix(in oklch, var(--blue) 14%, transparent)","border":"1px solid color-mix(in oklch, var(--blue) 40%, transparent)"}}>
                      <span style={{"flex":"1","fontSize":"13px","color":"var(--ink)"}}>
                        {ic?.from}
                        {" te está llamando para entrenar"}
                      </span>
                      <div onClick={ic?.accept} style={{"padding":"9px 16px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"#14111A","background":"var(--blue)","cursor":"pointer"}}>
                        {"Aceptar"}
                      </div>
                      <div onClick={ic?.decline} style={{"padding":"9px 16px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"var(--ink-2)","border":"1px solid var(--hair)","cursor":"pointer"}}>
                        {"Rechazar"}
                      </div>
                    </div>
                  </Fragment>
                ))}
              </>
            )}
            {v.battleShowMenu && (
              <>
                <p style={{"margin":"14px 0 18px","fontSize":"12.5px","lineHeight":"1.6","color":"var(--ink-2)","maxWidth":"560px"}}>
                  {"Elige cómo quieres usar Battle Training: transmite libremente, o entrena batallas en videollamada con un instructor con el que ya tengas una cátedra activa."}
                </p>
                <div style={{"display":"flex","gap":"14px","flexWrap":"wrap"}}>
                  <div onClick={v.onBattleGoLive} style={{"flex":"1","minWidth":"220px","padding":"18px","borderRadius":"18px","border":"1px solid var(--hair)","background":"var(--glass-2)","cursor":"pointer"}} className={cx(pc("hover", "border-color:var(--pink)"))}>
                    <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ink)"}}>
                      {v.battleLiveLabel}
                    </div>
                    <div style={{"marginTop":"6px","fontSize":"11.5px","color":"var(--ink-3)"}}>
                      {"Cualquier usuario puede transmitir libremente en la plataforma."}
                    </div>
                  </div>
                  <div onClick={v.onBattleOpenPractice} style={sty(v.battlePracticeCardStyle)}>
                    <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ink)"}}>
                      {"Modo Practice"}
                    </div>
                    <div style={{"marginTop":"6px","fontSize":"11.5px","color":"var(--ink-3)"}}>
                      {"Entrena batallas en videollamada con tu instructor. Disponible solo si tienes una cátedra activa."}
                    </div>
                  </div>
                </div>
              </>
            )}
            {v.battleShowPick && (
              <>
                <p style={{"margin":"14px 0 12px","fontSize":"12.5px","color":"var(--ink-2)"}}>
                  {"¿A cuál instructor quieres llamar?"}
                </p>
                <div style={{"display":"flex","flexDirection":"column","gap":"8px"}}>
                  {(v.battleInstructors ?? []).map((ins: any, $index: number) => (
                    <Fragment key={$index}>
                      <div onClick={ins?.call} style={{"display":"flex","alignItems":"center","padding":"12px 16px","borderRadius":"14px","border":"1px solid var(--hair)","background":"var(--glass-2)","cursor":"pointer"}} className={cx(pc("hover", "border-color:var(--blue)"))}>
                        <span style={{"flex":"1","fontSize":"13px","color":"var(--ink)"}}>
                          {ins?.name}
                        </span>
                        <span style={{"fontSize":"11.5px","color":"var(--blue)","fontWeight":"700"}}>
                          {"Llamar"}
                        </span>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </>
            )}
            {v.battleShowCall && (
              <>
                <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"14px","marginTop":"14px"}}>
                  <div style={{"position":"relative","aspectRatio":"16/10","borderRadius":"18px","overflow":"hidden","background":"#000"}}>
                    <video ref={v.setLocalVideoEl} autoPlay="" muted="" playsInline="" style={{"width":"100%","height":"100%","objectFit":"contain"}}></video>
                    {' '}
                    <span style={{"position":"absolute","top":"10px","left":"10px","padding":"4px 10px","borderRadius":"999px","background":"rgba(0,0,0,.55)","color":"#fff","fontFamily":"'Geist Mono',monospace","fontSize":"9px"}}>
                      {"TÚ"}
                    </span>
                  </div>
                  <div style={{"position":"relative","aspectRatio":"16/10","borderRadius":"18px","overflow":"hidden","background":"#000"}}>
                    <video ref={v.setRemoteVideoEl} autoPlay="" playsInline="" style={{"width":"100%","height":"100%","objectFit":"contain"}}></video>
                    {' '}
                    <span style={{"position":"absolute","top":"10px","left":"10px","padding":"4px 10px","borderRadius":"999px","background":"rgba(0,0,0,.55)","color":"#fff","fontFamily":"'Geist Mono',monospace","fontSize":"9px"}}>
                      {"RIVAL"}
                    </span>
                  </div>
                </div>
                <div style={{"marginTop":"16px","display":"flex","flexDirection":"column","alignItems":"center","gap":"10px"}}>
                  {v.battleShowCountdown && (
                    <>
                      <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"56px","fontWeight":"800","color":"var(--pink)"}}>
                        {v.battleCountdownLabel}
                      </div>
                    </>
                  )}
                  {v.battleShowTimer && (
                    <>
                      <div style={{"textAlign":"center"}}>
                        <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".18em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                          {v.battleTurnLabel}
                        </div>
                        <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"40px","fontWeight":"800","color":"var(--ink)"}}>
                          {v.battleTurnSecsLabel}
                        </div>
                      </div>
                    </>
                  )}
                  {v.battleRoundDone && (
                    <>
                      <div style={{"fontSize":"13px","color":"var(--ink-2)"}}>
                        {"Entrenamiento terminado. ¡Buen trabajo a los dos!"}
                      </div>
                    </>
                  )}
                  <p style={{"margin":"0","fontSize":"11px","color":"var(--ink-3)","textAlign":"center","maxWidth":"420px"}}>
                    {"Comparte tu pantalla con el reproductor de música abierto para que suene durante tu turno."}
                  </p>
                  <div style={{"display":"flex","gap":"10px"}}>
                    {v.battleShowStartRound && (
                      <>
                        <div onClick={v.onBattleStartRound} style={{"padding":"11px 22px","borderRadius":"999px","fontSize":"12.5px","fontWeight":"700","color":"#14111A","background":"var(--pink)","cursor":"pointer"}}>
                          {"Iniciar ronda"}
                        </div>
                      </>
                    )}
                    <div onClick={v.onBattleHangUp} style={{"padding":"11px 22px","borderRadius":"999px","fontSize":"12.5px","fontWeight":"700","color":"var(--ink-2)","border":"1px solid var(--hair)","cursor":"pointer"}}>
                      {"Colgar"}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
      <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(300px,1fr))","gap":"20px","alignItems":"start"}}>
        <div style={{"gridColumn":"span 2","minWidth":"0","borderRadius":"26px","overflow":"hidden","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"blur(30px)","animation":"goldEdge 4.5s ease-in-out infinite"}}>
          <div style={{"height":"320px","position":"relative","background":"linear-gradient(135deg, color-mix(in oklch, var(--pink) 50%, #000 28%), color-mix(in oklch, var(--purple) 55%, #000 38%))"}}>
            <span style={{"position":"absolute","top":"16px","left":"16px","display":"inline-flex","alignItems":"center","gap":"6px","padding":"7px 13px","borderRadius":"999px","background":"var(--pink)","color":"#fff","fontFamily":"'Geist Mono',monospace","fontSize":"9px","fontWeight":"700","letterSpacing":".14em"}}>
              <span style={{"width":"5px","height":"5px","borderRadius":"50%","background":"#fff","animation":"livePulse 1.2s ease-in-out infinite"}}></span>
              {"EN DIRECTO"}
            </span>
            {' '}
            <span style={{"position":"absolute","top":"16px","right":"16px","padding":"7px 13px","borderRadius":"999px","background":"rgba(0,0,0,.4)","backdropFilter":"blur(10px)","color":"#fff","fontFamily":"'Geist Mono',monospace","fontSize":"10px","fontWeight":"700"}}>
              {"1 428 espectadores"}
            </span>
          </div>
          <div style={{"padding":"22px","display":"flex","alignItems":"center","gap":"16px","flexWrap":"wrap"}}>
            <div style={{"width":"46px","height":"46px","borderRadius":"50%","background":"linear-gradient(135deg,var(--blue),var(--purple))","flex":"0 0 46px"}}></div>
            <div style={{"flex":"1","minWidth":"200px"}}>
              <h3 style={{"margin":"0","fontSize":"16px","fontWeight":"700","color":"var(--ink)"}}>
                {"Brando Hermoso"}
              </h3>
              <p style={{"margin":"5px 0 0","fontSize":"13px","color":"var(--ink-2)"}}>
                {"Sala Central 01 · Aceleración de Rolls · 128 BPM"}
              </p>
            </div>
            <div style={{"display":"inline-flex","padding":"12px 22px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"var(--ink)","border":"1px solid var(--hair)","background":"var(--glass-2)","boxShadow":"var(--lg-edge)","cursor":"pointer"}} className={cx(pc("hover", "border-color:var(--pink)"))}>
              {"Encender mi cámara"}
            </div>
          </div>
        </div>
        <div style={{"display":"flex","flexDirection":"column","borderRadius":"26px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"blur(30px)","overflow":"hidden","height":"436px","boxShadow":"var(--lg-edge)"}}>
          <div style={{"padding":"16px 18px","borderBottom":"1px solid var(--hair-soft)","display":"flex","alignItems":"center","justifyContent":"space-between"}}>
            <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".18em","color":"var(--ink-2)","textTransform":"uppercase"}}>
              {"Chat de la sala"}
            </span>
            <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","fontWeight":"700","color":"#fff","background":"var(--pink)","padding":"4px 9px","borderRadius":"999px"}}>
              {"LIVE"}
            </span>
          </div>
          <div style={{"flex":"1","padding":"16px 18px","display":"flex","flexDirection":"column","gap":"16px","overflow":"auto"}}>
            <div style={{"display":"flex","gap":"10px"}}>
              <div style={{"width":"30px","height":"30px","flex":"0 0 30px","borderRadius":"50%","background":"linear-gradient(135deg,var(--purple),var(--pink))"}}></div>
              <div>
                <div style={{"fontSize":"12px","fontWeight":"700","color":"var(--ink)"}}>
                  {"Sara Waack"}
                </div>
                <div style={{"fontSize":"12px","lineHeight":"1.5","color":"var(--ink-2)","marginTop":"3px"}}>
                  {"¡Buenas noches a toda la familia de Waack On! Lista para entrenar."}
                </div>
              </div>
            </div>
            <div style={{"display":"flex","gap":"10px"}}>
              <div style={{"width":"30px","height":"30px","flex":"0 0 30px","borderRadius":"50%","background":"linear-gradient(135deg,var(--blue),var(--purple))"}}></div>
              <div>
                <div style={{"fontSize":"12px","fontWeight":"700","color":"var(--ink)"}}>
                  {"Pedro Punking"}
                </div>
                <div style={{"fontSize":"12px","lineHeight":"1.5","color":"var(--ink-2)","marginTop":"3px"}}>
                  {"Brando, ¿podrías repetir la aceleración de muñeca a 135 BPM?"}
                </div>
              </div>
            </div>
            <div style={{"display":"flex","gap":"10px"}}>
              <div style={{"width":"30px","height":"30px","flex":"0 0 30px","borderRadius":"50%","background":"linear-gradient(135deg,var(--yellow),var(--pink))"}}></div>
              <div>
                <div style={{"fontSize":"12px","fontWeight":"700","color":"var(--ink)"}}>
                  {"Elena Pose"}
                </div>
                <div style={{"fontSize":"12px","lineHeight":"1.5","color":"var(--ink-2)","marginTop":"3px"}}>
                  {"¡Qué buen track de calentamiento! La energía de la sala está brutal."}
                </div>
              </div>
            </div>
          </div>
          <div style={{"padding":"14px 16px","borderTop":"1px solid var(--hair-soft)","display":"flex","gap":"10px","alignItems":"center"}}>
            <div style={{"flex":"1","padding":"11px 16px","borderRadius":"999px","border":"1px solid var(--hair)","background":"var(--glass-2)","fontSize":"12px","color":"var(--ink-3)"}}>
              {"Escribe un mensaje…"}
            </div>
            <div style={{"width":"38px","height":"38px","flex":"0 0 38px","borderRadius":"50%","background":"var(--pink)","display":"flex","alignItems":"center","justifyContent":"center","cursor":"pointer"}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round">
                <path d="m22 2-7 20-4-9-9-4 20-7Z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
