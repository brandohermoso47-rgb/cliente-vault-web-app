// Instructor Panel - Disco Ball 3D Design
// Adapted for integration with App.tsx state management
import React, { Fragment, useRef } from 'react';
import { cx, pc, sty } from '../lib/dc';
import DiscoBallWidget, { type DiscoBallWidgetHandle } from '../components/DiscoBallWidget';

export default function Instructor({ v }: { v: any }) {
  const discoBallRef = useRef<DiscoBallWidgetHandle>(null);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--hair)',
      }}>
        <div>
          <div style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: '32px',
            fontWeight: '700',
            color: 'var(--ink)',
            letterSpacing: '-0.01em',
          }}>
            Laboratorio del Instructor
          </div>
          <div style={{
            fontSize: '14px',
            color: 'var(--ink-2)',
            marginTop: '6px',
          }}>
            Administra tu cátedra, crea tus clases y haz crecer tus ingresos
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        borderBottom: '1px solid var(--hair)',
        paddingBottom: '12px',
      }}>
        {(v.insTabList ?? []).map((t: any, $index: number) => (
          <Fragment key={$index}>
            <button
              onClick={t?.pick}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                border: 'none',
                background: t?.active ? 'var(--pink)' : 'var(--glass)',
                color: t?.active ? '#fff' : 'var(--ink-2)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              className={cx(pc("hover", "opacity:.9"))}
            >
              {t?.label}
              {t?.hasBadge && (
                <span style={{
                  marginLeft: '6px',
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '11px',
                  opacity: 0.75,
                }}>
                  {t?.badge}
                </span>
              )}
            </button>
          </Fragment>
        ))}
      </div>

      {/* Dashboard View */}
      {v.insIsDashboard && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: '24px',
          alignItems: 'start',
        }}>
          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            {(v.insStatCards ?? []).map((s: any, $index: number) => (
              <Fragment key={$index}>
                <div style={{
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid var(--hair)',
                  background: 'var(--glass)',
                  backdropFilter: 'var(--lg-blur)',
                  WebkitBackdropFilter: 'var(--lg-blur)',
                  boxShadow: 'var(--lg-edge)',
                }}>
                  <div style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--ink-3)',
                    marginBottom: '12px',
                  }}>
                    {s?.label}
                  </div>
                  <div style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontSize: '28px',
                    fontWeight: '700',
                    color: 'var(--ink)',
                    marginBottom: '8px',
                  }}>
                    {s?.value}
                  </div>
                  {s?.delta && (
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--pink)',
                    }}>
                      {s?.delta}
                    </div>
                  )}
                </div>
              </Fragment>
            ))}
          </div>

          {/* Disco Ball Widget */}
          <div style={{
            padding: '24px',
            borderRadius: '20px',
            border: '1px solid var(--hair)',
            background: 'var(--glass)',
            backdropFilter: 'var(--lg-blur)',
            WebkitBackdropFilter: 'var(--lg-blur)',
            boxShadow: 'var(--lg-edge)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div>
              <div style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '10px',
                letterSpacing: '0.2em',
                color: 'var(--pink)',
                fontWeight: '700',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}>
                Sala de Clase
              </div>
              <div style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: '24px',
                letterSpacing: '-0.01em',
                color: 'var(--ink)',
              }}>
                Bola Disco 3D
              </div>
            </div>

            <div style={{
              aspectRatio: '1',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid var(--hair)',
            }}>
              <DiscoBallWidget
                ref={discoBallRef}
                bpm={v.insBpm ?? 120}
                live={v.insLive ?? false}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <label style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11px',
                color: 'var(--ink-3)',
                textTransform: 'uppercase',
                fontWeight: '600',
              }}>
                Tempo:
              </label>
              <input
                type="range"
                min="80"
                max="150"
                step="1"
                value={v.insBpm ?? 120}
                onChange={v.setInsBpm}
                style={{
                  flex: 1,
                  accentColor: 'var(--pink)',
                  cursor: 'pointer',
                }}
              />
              <span style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: '18px',
                color: 'var(--ink)',
                minWidth: '40px',
                textAlign: 'right',
              }}>
                {v.insBpm ?? 120}
              </span>
            </div>

            <button
              onClick={v.toggleInsLive}
              style={{
                padding: '12px 20px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: '700',
                color: '#1A1400',
                background: v.insLive ? 'var(--pink)' : 'var(--gold-hi)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,.3)',
                transition: 'all 0.2s',
              }}
              className={cx(pc("hover", "opacity:.9"))}
            >
              {v.insLiveLabel || (v.insLive ? 'Clase en Vivo' : 'Iniciar Clase')}
            </button>
          </div>
        </div>
      )}

      {/* Students View */}
      {v.insIsStudents && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {(v.insStudentsList ?? []).map((r: any, $index: number) => (
            <Fragment key={$index}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 18px',
                borderRadius: '16px',
                border: '1px solid var(--hair)',
                background: 'var(--glass)',
                backdropFilter: 'var(--lg-blur)',
                WebkitBackdropFilter: 'var(--lg-blur)',
                boxShadow: 'var(--lg-edge)',
              }}>
                <div style={{
                  flex: 1,
                  minWidth: '200px',
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: 'var(--ink)',
                  }}>
                    {r?.name}
                  </div>
                  <div style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '11px',
                    color: 'var(--ink-3)',
                    marginTop: '4px',
                  }}>
                    {r?.email}
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '160px',
                }}>
                  <div style={{
                    flex: 1,
                    height: '5px',
                    borderRadius: '999px',
                    background: 'var(--hair)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${r?.progress ?? 0}%`,
                      height: '100%',
                      background: 'var(--pink)',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                  <span style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--ink)',
                  }}>
                    {r?.progress ?? 0}%
                  </span>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      )}

      {/* Classes View */}
      {v.insIsClasses && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          {/* Create Class Form */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid var(--hair)',
            background: 'var(--glass)',
            backdropFilter: 'var(--lg-blur)',
            WebkitBackdropFilter: 'var(--lg-blur)',
            boxShadow: 'var(--lg-edge)',
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '700',
              color: 'var(--ink)',
              marginBottom: '8px',
            }}>
              Crear Nueva Clase
            </div>
            <input
              value={v.insClassTitleValue ?? ''}
              onChange={v.insClassTitleChange}
              placeholder="Título de la clase"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid var(--hair)',
                background: 'var(--glass-2)',
                color: 'var(--ink)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
            }}>
              <input
                value={v.insClassScheduleDayValue ?? ''}
                onChange={v.insClassScheduleDayChange}
                placeholder="Día (ej. Lunes)"
                style={{
                  boxSizing: 'border-box',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--hair)',
                  background: 'var(--glass-2)',
                  color: 'var(--ink)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <input
                value={v.insClassScheduleTimeValue ?? ''}
                onChange={v.insClassScheduleTimeChange}
                placeholder="Hora (ej. 19:00)"
                style={{
                  boxSizing: 'border-box',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--hair)',
                  background: 'var(--glass-2)',
                  color: 'var(--ink)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <input
                type="number"
                value={v.insClassCapacityValue ?? 10}
                onChange={v.insClassCapacityChange}
                placeholder="Capacidad"
                min="1"
                style={{
                  boxSizing: 'border-box',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--hair)',
                  background: 'var(--glass-2)',
                  color: 'var(--ink)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
            <input
              value={v.insClassDescriptionValue ?? ''}
              onChange={v.insClassDescriptionChange}
              placeholder="Descripción (opcional)"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid var(--hair)',
                background: 'var(--glass-2)',
                color: 'var(--ink)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            {v.insClassErr && (
              <div style={{
                fontSize: '12px',
                color: '#FF9A7A',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 154, 122, 0.1)',
              }}>
                {v.insClassErr}
              </div>
            )}
            <button
              onClick={v.insClassSubmit}
              style={{
                padding: '11px 20px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#1A1400',
                background: 'var(--pink)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px -4px var(--pink), inset 0 1px 0 rgba(255,255,255,.3)',
                transition: 'all 0.2s',
                opacity: v.insClassBusy ? 0.7 : 1,
              }}
              disabled={v.insClassBusy}
              className={cx(pc("hover", "opacity:.9"))}
            >
              {v.insClassLabel || 'Crear Clase'}
            </button>
          </div>

          {/* Classes List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            {(v.insClassList ?? []).map((c: any, $index: number) => (
              <Fragment key={$index}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px 18px',
                  borderRadius: '16px',
                  border: '1px solid var(--hair)',
                  background: 'var(--glass)',
                  backdropFilter: 'var(--lg-blur)',
                  WebkitBackdropFilter: 'var(--lg-blur)',
                  boxShadow: 'var(--lg-edge)',
                }}>
                  <div style={{
                    flex: 1,
                    minWidth: '200px',
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: 'var(--ink)',
                    }}>
                      {c?.title}
                    </div>
                    <div style={{
                      fontFamily: "'Geist Mono', monospace",
                      fontSize: '11px',
                      color: 'var(--ink-3)',
                      marginTop: '4px',
                    }}>
                      {c?.schedule} · {c?.capacity} estudiantes
                    </div>
                  </div>
                  <button
                    style={{
                      padding: '8px 14px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--ink)',
                      border: '1px solid var(--hair)',
                      background: 'var(--glass-2)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    className={cx(pc("hover", "border-color:var(--pink)"))}
                  >
                    Abrir
                  </button>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Finances View */}
      {v.insIsFinances && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          {/* Bank Account Form */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid var(--hair)',
            background: 'var(--glass)',
            backdropFilter: 'var(--lg-blur)',
            WebkitBackdropFilter: 'var(--lg-blur)',
            boxShadow: 'var(--lg-edge)',
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '700',
              color: 'var(--ink)',
              marginBottom: '8px',
            }}>
              Datos Bancarios
            </div>
            <input
              value={v.insFinancesIbanValue ?? ''}
              onChange={v.insFinancesIbanChange}
              placeholder="IBAN"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid var(--hair)',
                background: 'var(--glass-2)',
                color: 'var(--ink)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <input
              value={v.insFinancesAccountHolderValue ?? ''}
              onChange={v.insFinancesAccountHolderChange}
              placeholder="Titular de la cuenta"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid var(--hair)',
                background: 'var(--glass-2)',
                color: 'var(--ink)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <input
              value={v.insFinancesBankNameValue ?? ''}
              onChange={v.insFinancesBankNameChange}
              placeholder="Nombre del banco"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid var(--hair)',
                background: 'var(--glass-2)',
                color: 'var(--ink)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            {v.insFinancesErr && (
              <div style={{
                fontSize: '12px',
                color: '#FF9A7A',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 154, 122, 0.1)',
              }}>
                {v.insFinancesErr}
              </div>
            )}
            <button
              onClick={v.insFinancesSubmit}
              style={{
                padding: '11px 20px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#1A1400',
                background: 'var(--pink)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px -4px var(--pink), inset 0 1px 0 rgba(255,255,255,.3)',
                transition: 'all 0.2s',
                opacity: v.insFinancesBusy ? 0.7 : 1,
              }}
              disabled={v.insFinancesBusy}
              className={cx(pc("hover", "opacity:.9"))}
            >
              {v.insFinancesLabel || 'Guardar Datos'}
            </button>
          </div>

          {/* Finance Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            {(v.insFinancesStats ?? []).map((stat: any, $index: number) => (
              <Fragment key={$index}>
                <div style={{
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid var(--hair)',
                  background: 'var(--glass)',
                  backdropFilter: 'var(--lg-blur)',
                  WebkitBackdropFilter: 'var(--lg-blur)',
                  boxShadow: 'var(--lg-edge)',
                }}>
                  <div style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--ink-3)',
                    marginBottom: '12px',
                  }}>
                    {stat?.label}
                  </div>
                  <div style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontSize: '28px',
                    fontWeight: '700',
                    color: 'var(--ink)',
                  }}>
                    {stat?.value}
                  </div>
                  {stat?.description && (
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--ink-2)',
                      marginTop: '8px',
                    }}>
                      {stat?.description}
                    </div>
                  )}
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Courses View */}
      {v.insIsPublish && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          {/* Create Course Form */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid var(--hair)',
            background: 'var(--glass)',
            backdropFilter: 'var(--lg-blur)',
            WebkitBackdropFilter: 'var(--lg-blur)',
            boxShadow: 'var(--lg-edge)',
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '700',
              color: 'var(--ink)',
              marginBottom: '8px',
            }}>
              Crear Nuevo Curso
            </div>
            <input
              value={v.insCoursetTitleValue ?? ''}
              onChange={v.insCoursetTitleChange}
              placeholder="Título del curso"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid var(--hair)',
                background: 'var(--glass-2)',
                color: 'var(--ink)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <input
              value={v.insCourseDescValue ?? ''}
              onChange={v.insCourseDescChange}
              placeholder="Descripción (opcional)"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid var(--hair)',
                background: 'var(--glass-2)',
                color: 'var(--ink)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            {v.insCourseErr && (
              <div style={{
                fontSize: '12px',
                color: '#FF9A7A',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 154, 122, 0.1)',
              }}>
                {v.insCourseErr}
              </div>
            )}
            <button
              onClick={v.insCourseSubmit}
              style={{
                padding: '11px 20px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#1A1400',
                background: 'var(--pink)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px -4px var(--pink), inset 0 1px 0 rgba(255,255,255,.3)',
                transition: 'all 0.2s',
                opacity: v.insCourseBusy ? 0.7 : 1,
              }}
              disabled={v.insCourseBusy}
              className={cx(pc("hover", "opacity:.9"))}
            >
              {v.insCourseLabel || 'Crear Curso'}
            </button>
          </div>

          {/* Courses List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            {(v.insCourseList ?? []).map((course: any, $index: number) => (
              <Fragment key={$index}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px 18px',
                  borderRadius: '16px',
                  border: '1px solid var(--hair)',
                  background: 'var(--glass)',
                  backdropFilter: 'var(--lg-blur)',
                  WebkitBackdropFilter: 'var(--lg-blur)',
                  boxShadow: 'var(--lg-edge)',
                }}>
                  <div style={{
                    flex: 1,
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: 'var(--ink)',
                    }}>
                      {course?.title}
                    </div>
                    {course?.description && (
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--ink-2)',
                        marginTop: '4px',
                      }}>
                        {course?.description}
                      </div>
                    )}
                  </div>
                  <button
                    style={{
                      padding: '8px 14px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#1A1400',
                      background: 'linear-gradient(90deg, var(--gold-hi), var(--gold-lo))',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.3)',
                      transition: 'all 0.2s',
                    }}
                    className={cx(pc("hover", "opacity:.9"))}
                  >
                    Editar
                  </button>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Podcasts View */}
      {v.insIsPods && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          {/* Create Podcast Form */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid var(--hair)',
            background: 'var(--glass)',
            backdropFilter: 'var(--lg-blur)',
            WebkitBackdropFilter: 'var(--lg-blur)',
            boxShadow: 'var(--lg-edge)',
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '700',
              color: 'var(--ink)',
              marginBottom: '8px',
            }}>
              Crear Nuevo Podcast
            </div>
            <input
              value={v.insPodcastTitleValue ?? ''}
              onChange={v.insPodcastTitleChange}
              placeholder="Título del podcast"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid var(--hair)',
                background: 'var(--glass-2)',
                color: 'var(--ink)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <input
              value={v.insPodcastDescValue ?? ''}
              onChange={v.insPodcastDescChange}
              placeholder="Descripción (opcional)"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid var(--hair)',
                background: 'var(--glass-2)',
                color: 'var(--ink)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            {v.insPodcastErr && (
              <div style={{
                fontSize: '12px',
                color: '#FF9A7A',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 154, 122, 0.1)',
              }}>
                {v.insPodcastErr}
              </div>
            )}
            <button
              onClick={v.insPodcastSubmit}
              style={{
                padding: '11px 20px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#1A1400',
                background: 'var(--pink)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px -4px var(--pink), inset 0 1px 0 rgba(255,255,255,.3)',
                transition: 'all 0.2s',
                opacity: v.insPodcastBusy ? 0.7 : 1,
              }}
              disabled={v.insPodcastBusy}
              className={cx(pc("hover", "opacity:.9"))}
            >
              {v.insPodcastLabel || 'Crear Podcast'}
            </button>
          </div>

          {/* Podcasts List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            {(v.insPodList ?? []).map((podcast: any, $index: number) => (
              <Fragment key={$index}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px 18px',
                  borderRadius: '16px',
                  border: '1px solid var(--hair)',
                  background: 'var(--glass)',
                  backdropFilter: 'var(--lg-blur)',
                  WebkitBackdropFilter: 'var(--lg-blur)',
                  boxShadow: 'var(--lg-edge)',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, var(--pink), var(--purple))',
                    color: '#fff',
                    flex: '0 0 40px',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <div style={{
                    flex: 1,
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: 'var(--ink)',
                    }}>
                      {podcast?.title}
                    </div>
                    {podcast?.description && (
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--ink-2)',
                        marginTop: '4px',
                      }}>
                        {podcast?.description}
                      </div>
                    )}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
