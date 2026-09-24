// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function Grupos({ v }: { v: any }) {
  return (
    <>
    <div style={{"display":"flex","flexDirection":"column","gap":"22px","maxWidth":"980px"}}>
      {v.gShowList && (
        <>
          <p style={{"margin":"0","fontSize":"13px","lineHeight":"1.6","color":"var(--ink-2)","maxWidth":"620px"}}>
            {"Crea un grupo para chatear, compartir fotos y videos, y conectarte fácil con tu crew o tu clase. Comparte el código o el enlace y quien lo reciba entra con un toque."}
          </p>
          <div style={{"display":"flex","alignItems":"center","gap":"12px","flexWrap":"wrap"}}>
            <div onClick={v.gGoCreate} style={{"padding":"12px 20px","borderRadius":"999px","fontSize":"12.5px","fontWeight":"700","color":"#1A1400","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","boxShadow":"inset 0 1px 0 rgba(255,255,255,.5)","cursor":"pointer"}}>
              {"Crear grupo"}
            </div>
            <div onClick={v.gGoJoin} style={{"padding":"12px 20px","borderRadius":"999px","fontSize":"12.5px","fontWeight":"700","color":"var(--ink)","border":"1px solid var(--hair)","background":"var(--glass-2)","cursor":"pointer"}}>
              {"Unirme con código"}
            </div>
          </div>
          {v.gHasGroups && (
            <>
              <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fill,minmax(280px,1fr))","gap":"16px"}}>
                {(v.gGroups ?? []).map((g: any, $index: number) => (
                  <Fragment key={$index}>
                    <div onClick={g?.open} style={sty(g?.card)} className={cx(pc("hover", "border-color:var(--blue)"))}>
                      <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".16em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                        {g?.meta}
                      </div>
                      <div style={{"fontSize":"16px","fontWeight":"700","color":"var(--ink)"}}>
                        {g?.name}
                      </div>
                      <div style={{"fontSize":"12.5px","color":"var(--ink-2)"}}>
                        {g?.desc}
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </>
          )}
          {!v.gHasGroups && (
            <>
              <div style={{"padding":"28px","borderRadius":"22px","border":"1px dashed var(--hair)","textAlign":"center","fontSize":"13px","color":"var(--ink-3)"}}>
                {"Todavía no estás en ningún grupo. Crea uno o únete con un código."}
              </div>
            </>
          )}
        </>
      )}
      {v.gShowCreate && (
        <>
          <div style={{"display":"flex","flexDirection":"column","gap":"12px","padding":"22px","borderRadius":"24px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)"}}>
            <div style={{"fontSize":"15px","fontWeight":"700","color":"var(--ink)"}}>
              {"Crear un grupo"}
            </div>
            {v.gCanClase && (
              <>
                <div style={{"display":"flex","gap":"8px","flexWrap":"wrap"}}>
                  {(v.gKindPicker ?? []).map((k: any, $index: number) => (
                    <Fragment key={$index}>
                      <div onClick={k?.pick} style={sty(k?.style)}>
                        {k?.label}
                      </div>
                    </Fragment>
                  ))}
                </div>
                <div style={{"fontSize":"11.5px","color":"var(--ink-3)"}}>
                  {"Una clase grupal es un grupo donde solo tú (instructor) publicas el resumen de la clase; tus alumnos chatean y comparten."}
                </div>
              </>
            )}
            <input value={v.gNameValue} onChange={v.gNameChange} placeholder="Nombre del grupo" maxlength="60" style={{"width":"100%","boxSizing":"border-box","padding":"11px 14px","borderRadius":"14px","border":"1px solid var(--hair)","background":"var(--glass-2)","color":"var(--ink)","fontSize":"13px","outline":"none"}} />
            <textarea value={v.gDescValue} onChange={v.gDescChange} placeholder="Descripción (opcional)" rows="2" maxlength="280" style={{"width":"100%","boxSizing":"border-box","padding":"11px 14px","borderRadius":"14px","border":"1px solid var(--hair)","background":"var(--glass-2)","color":"var(--ink)","fontFamily":"inherit","fontSize":"13px","outline":"none","resize":"vertical"}}></textarea>
            {v.gErr && (
              <>
                <div style={{"fontSize":"11.5px","color":"var(--pink)"}}>
                  {v.gErr}
                </div>
              </>
            )}
            <div style={{"display":"flex","gap":"10px"}}>
              <div onClick={v.gGoList} style={{"flex":"1","textAlign":"center","padding":"12px","borderRadius":"999px","fontSize":"12.5px","fontWeight":"700","color":"var(--ink-2)","border":"1px solid var(--hair)","cursor":"pointer"}}>
                {"Cancelar"}
              </div>
              <div onClick={v.gCreate} style={{"flex":"1","textAlign":"center","padding":"12px","borderRadius":"999px","fontSize":"12.5px","fontWeight":"700","color":"#1A1400","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","cursor":"pointer"}}>
                {v.gCreateLabel}
              </div>
            </div>
          </div>
        </>
      )}
      {v.gShowJoin && (
        <>
          <div style={{"display":"flex","flexDirection":"column","gap":"12px","padding":"22px","borderRadius":"24px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)"}}>
            <div style={{"fontSize":"15px","fontWeight":"700","color":"var(--ink)"}}>
              {"Unirme a un grupo"}
            </div>
            <div style={{"fontSize":"12.5px","color":"var(--ink-2)"}}>
              {"Pega el código de 10 letras y números, o el enlace de invitación que te enviaron."}
            </div>
            <input value={v.gJoinValue} onChange={v.gJoinChange} placeholder="Código o enlace del grupo" style={{"width":"100%","boxSizing":"border-box","padding":"11px 14px","borderRadius":"14px","border":"1px solid var(--hair)","background":"var(--glass-2)","color":"var(--ink)","fontFamily":"'Geist Mono',monospace","fontSize":"13px","outline":"none"}} />
            {v.gErr && (
              <>
                <div style={{"fontSize":"11.5px","color":"var(--pink)"}}>
                  {v.gErr}
                </div>
              </>
            )}
            <div style={{"display":"flex","gap":"10px"}}>
              <div onClick={v.gGoList} style={{"flex":"1","textAlign":"center","padding":"12px","borderRadius":"999px","fontSize":"12.5px","fontWeight":"700","color":"var(--ink-2)","border":"1px solid var(--hair)","cursor":"pointer"}}>
                {"Cancelar"}
              </div>
              <div onClick={v.gJoin} style={{"flex":"1","textAlign":"center","padding":"12px","borderRadius":"999px","fontSize":"12.5px","fontWeight":"700","color":"#1A1400","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","cursor":"pointer"}}>
                {v.gJoinLabel}
              </div>
            </div>
          </div>
        </>
      )}
      {v.gShowChat && (
        <>
          <div style={{"display":"flex","flexDirection":"column","gap":"14px","padding":"20px 22px","borderRadius":"24px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)"}}>
            <div style={{"display":"flex","alignItems":"flex-start","justifyContent":"space-between","gap":"12px","flexWrap":"wrap"}}>
              <div style={{"minWidth":"0"}}>
                <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".18em","color":"var(--purple)","fontWeight":"700"}}>
                  {v.gKindLabel}
                </div>
                <div style={{"marginTop":"6px","fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"30px","letterSpacing":"-0.01em","color":"var(--ink)"}}>
                  {v.gTitle}
                </div>
                <div style={{"marginTop":"4px","fontSize":"12.5px","color":"var(--ink-2)"}}>
                  {v.gDescription}
                </div>
              </div>
              <div onClick={v.gBack} style={{"padding":"9px 16px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"var(--ink-2)","border":"1px solid var(--hair)","cursor":"pointer","whiteSpace":"nowrap"}}>
                {"← Mis grupos"}
              </div>
            </div>
            <div style={{"display":"flex","alignItems":"center","gap":"8px","flexWrap":"wrap"}}>
              <span style={{"padding":"8px 12px","borderRadius":"12px","border":"1px solid var(--hair)","background":"var(--glass-2)","fontFamily":"'Geist Mono',monospace","fontSize":"12px","color":"var(--ink)"}}>
                {v.gCode}
              </span>
              <div onClick={v.gCopyCode} style={{"padding":"9px 14px","borderRadius":"999px","fontSize":"11.5px","fontWeight":"700","color":"var(--ink)","border":"1px solid var(--hair)","background":"var(--glass-2)","cursor":"pointer"}}>
                {v.gCopyCodeLabel}
              </div>
              <div onClick={v.gCopyLink} style={{"padding":"9px 14px","borderRadius":"999px","fontSize":"11.5px","fontWeight":"700","color":"var(--ink)","border":"1px solid var(--hair)","background":"var(--glass-2)","cursor":"pointer"}}>
                {v.gCopyLinkLabel}
              </div>
              <div onClick={v.gShare} style={{"padding":"9px 14px","borderRadius":"999px","fontSize":"11.5px","fontWeight":"700","color":"#1A1400","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","cursor":"pointer"}}>
                {"Invitar / Compartir"}
              </div>
            </div>
            <div style={{"display":"flex","alignItems":"center","gap":"8px","flexWrap":"wrap"}}>
              <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".14em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                {v.gMembersLabel}
              </span>
              {(v.gMembers ?? []).map((mb: any, $index: number) => (
                <Fragment key={$index}>
                  <span style={{"padding":"5px 11px","borderRadius":"999px","border":"1px solid var(--hair)","background":"var(--glass-2)","fontSize":"11.5px","color":"var(--ink-2)"}}>
                    {mb?.name}
                  </span>
                </Fragment>
              ))}
            </div>
          </div>
          <div style={{"display":"flex","flexDirection":"column-reverse","gap":"10px","minHeight":"260px","maxHeight":"520px","overflowY":"auto","padding":"6px 2px"}}>
            {(v.gMsgs ?? []).map((m: any, $index: number) => (
              <Fragment key={$index}>
                <div style={sty(m?.wrap)}>
                  <div style={sty(m?.bubble)}>
                    <div style={{"display":"flex","alignItems":"center","gap":"8px","fontSize":"11px","color":"var(--ink-3)","marginBottom":"4px"}}>
                      {m?.isResumen && (
                        <>
                          <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"8px","fontWeight":"700","letterSpacing":".12em","color":"#1A1400","background":"var(--gold)","padding":"2px 7px","borderRadius":"999px"}}>
                            {"RESUMEN DE LA CLASE"}
                          </span>
                        </>
                      )}
                      <span style={{"fontWeight":"700","color":"var(--ink-2)"}}>
                        {m?.name}
                      </span>
                      <span>
                        {m?.time}
                      </span>
                      {m?.canDelete && (
                        <>
                          <span onClick={m?.del} style={{"cursor":"pointer","color":"var(--pink)"}}>
                            {"Borrar"}
                          </span>
                        </>
                      )}
                    </div>
                    {m?.hasText && (
                      <>
                        <div style={{"fontSize":"13.5px","lineHeight":"1.55","color":"var(--ink)","whiteSpace":"pre-wrap","wordBreak":"break-word"}}>
                          {m?.text}
                        </div>
                      </>
                    )}
                    {m?.hasImage && (
                      <>
                        <img src={m?.mediaUrl} alt="" style={{"marginTop":"8px","maxWidth":"100%","maxHeight":"340px","borderRadius":"14px","display":"block"}} />
                      </>
                    )}
                    {m?.hasVideo && (
                      <>
                        <video src={m?.mediaUrl} controls="" playsInline="" style={{"marginTop":"8px","maxWidth":"100%","maxHeight":"340px","borderRadius":"14px","display":"block"}}></video>
                      </>
                    )}
                  </div>
                </div>
              </Fragment>
            ))}
            {!v.gHasMsgs && (
              <>
                <div style={{"textAlign":"center","fontSize":"12.5px","color":"var(--ink-3)","padding":"30px 0"}}>
                  {"Aún no hay mensajes. ¡Escribe el primero!"}
                </div>
              </>
            )}
          </div>
          <div style={{"display":"flex","flexDirection":"column","gap":"10px","padding":"16px 18px","borderRadius":"22px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)"}}>
            <textarea value={v.gTextValue} onChange={v.gTextChange} placeholder="Escribe un mensaje…" rows="2" style={{"width":"100%","boxSizing":"border-box","padding":"11px 14px","borderRadius":"14px","border":"1px solid var(--hair)","background":"var(--glass-2)","color":"var(--ink)","fontFamily":"inherit","fontSize":"13px","outline":"none","resize":"vertical"}}></textarea>
            {v.gFileName && (
              <>
                <div style={{"fontSize":"11.5px","color":"var(--ink-2)"}}>
                  {"📎 "}
                  {v.gFileName}
                  {" "}
                  <span onClick={v.gClearFile} style={{"cursor":"pointer","color":"var(--pink)","marginLeft":"6px"}}>
                    {"Quitar"}
                  </span>
                </div>
              </>
            )}
            {v.gErr && (
              <>
                <div style={{"fontSize":"11.5px","color":"var(--pink)"}}>
                  {v.gErr}
                </div>
              </>
            )}
            <input id="group-media-input" type="file" accept="image/*,video/*" onChange={v.gOnFile} style={{"display":"none"}} />
            <div style={{"display":"flex","alignItems":"center","gap":"10px","flexWrap":"wrap"}}>
              <div onClick={v.gPickFile} style={{"padding":"10px 16px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"var(--ink)","border":"1px solid var(--hair)","background":"var(--glass-2)","cursor":"pointer"}}>
                {"📷 Foto o video"}
              </div>
              <div style={{"flex":"1"}}></div>
              {v.gCanResumen && (
                <>
                  <div onClick={v.gSendResumen} style={{"padding":"10px 16px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"var(--ink)","border":"1px solid var(--gold)","cursor":"pointer"}}>
                    {"Publicar como resumen de la clase"}
                  </div>
                </>
              )}
              <div onClick={v.gSendMsg} style={{"padding":"10px 22px","borderRadius":"999px","fontSize":"12.5px","fontWeight":"700","color":"#1A1400","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","cursor":"pointer"}}>
                {v.gSendLabel}
              </div>
            </div>
            <div style={{"display":"flex","gap":"14px","flexWrap":"wrap","fontSize":"11.5px"}}>
              {v.gIsNotOwner && (
                <>
                  <span onClick={v.gLeave} style={{"cursor":"pointer","color":"var(--ink-3)"}}>
                    {"Salir del grupo"}
                  </span>
                </>
              )}
              {v.gIsOwner && (
                <>
                  <span onClick={v.gDelete} style={{"cursor":"pointer","color":"var(--pink)"}}>
                    {"Borrar el grupo para todos"}
                  </span>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
    </>
  );
}
