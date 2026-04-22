import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const questions = [
  {
    title: '周末的深夜，你通常处于哪种状态？',
    options: ['A. 死磕一个细节', 'B. 寻找新奇知识', 'C. 沉浸在小世界'],
  },
  {
    title: '你的大脑频道正在播放什么白噪音？',
    options: ['A. 机械运转声', 'B. 科幻电子音', 'C. 大自然风声'],
  },
  {
    title: '面对一个未知的黑盒，你会？',
    options: ['A. 拆开看看结构', 'B. 观察它的反应', 'C. 记录它的数据'],
  },
];

const fallbackMatchResult = {
  label: '未知的流浪者',
  icebreakers: ['雷达信号微弱，要不你先打个招呼？'],
};

const shellTransition = { type: 'spring', stiffness: 118, damping: 18 };
const panelTransition = { type: 'spring', stiffness: 130, damping: 20 };

export default function EchoHubMVP() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [matchResult, setMatchResult] = useState(fallbackMatchResult);
  const [showCorrectionOptions, setShowCorrectionOptions] = useState(false);
  const [hasSubmittedCorrection, setHasSubmittedCorrection] = useState(false);
  const [selectedIcebreaker, setSelectedIcebreaker] = useState('');
  const [showOutroCard, setShowOutroCard] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!selectedIcebreaker || step !== 4) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setShowOutroCard(true);
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [selectedIcebreaker, step]);

  const handleAnswer = async (optionText) => {
    const newAnswers = [...answers, optionText];
    setAnswers(newAnswers);

    if (newAnswers.length < questions.length) {
      return;
    }

    setStep(2);
    setShowCorrectionOptions(false);
    setHasSubmittedCorrection(false);
    setSelectedIcebreaker('');
    setShowOutroCard(false);

    try {
      const response = await fetch('https://echo-hub-backend.onrender.com/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: newAnswers }),
      });

      const data = await response.json();

      setMatchResult({
        label: data.label || fallbackMatchResult.label,
        icebreakers:
          Array.isArray(data.icebreakers) && data.icebreakers.length > 0
            ? data.icebreakers.slice(0, 3)
            : fallbackMatchResult.icebreakers,
      });
      setStep(3);
    } catch (error) {
      console.error('雷达连接断开:', error);
      alert('连接后端失败了！请检查后端服务是否正常运行。');
      setAnswers([]);
      setStep(1);
    }
  };

  const handleCorrectionToggle = (event) => {
    event.stopPropagation();
    if (hasSubmittedCorrection) {
      return;
    }
    setShowCorrectionOptions((prev) => !prev);
  };

  const handleCorrectionSubmit = (event) => {
    event.stopPropagation();
    setShowCorrectionOptions(false);
    setHasSubmittedCorrection(true);
  };

  const handleOpenChat = () => {
    setSelectedIcebreaker('');
    setShowOutroCard(false);
    setStep(4);
  };

  const handleSkipChat = () => {
    setAnswers([]);
    setMatchResult(fallbackMatchResult);
    setShowCorrectionOptions(false);
    setHasSubmittedCorrection(false);
    setSelectedIcebreaker('');
    setShowOutroCard(false);
    setStep(1);
  };

  const handleIcebreakerSend = (text) => {
    setSelectedIcebreaker(text);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: 'sans-serif',
      }}
    >
      <motion.div
        animate={{ x: mousePosition.x - 400, y: mousePosition.y - 400 }}
        transition={{ type: 'tween', ease: 'backOut', duration: 0.5 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '800px',
          height: '800px',
          background:
            'radial-gradient(circle, rgba(0,255,204,0.06) 0%, rgba(0,0,0,0) 60%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div style={{ zIndex: 10, width: '100%', maxWidth: '560px', padding: '20px' }}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={panelTransition}
            >
              <h2 style={{ color: '#fff', marginBottom: '30px', textAlign: 'center' }}>
                {questions[answers.length]?.title}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {questions[answers.length]?.options.map((opt, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(0,255,204,0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(opt)}
                    style={{
                      padding: '16px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#ccc',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '1rem',
                    }}
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={panelTransition}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '150px',
                  height: '150px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <motion.div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '2px solid #00ffcc',
                  }}
                  animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '2px solid #00ffcc',
                  }}
                  animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut',
                    delay: 1,
                  }}
                />
                <motion.div
                  style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: '#00ffcc',
                    borderRadius: '50%',
                    boxShadow: '0 0 20px #00ffcc',
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                />
              </div>
              <p
                style={{
                  color: '#00ffcc',
                  marginTop: '40px',
                  letterSpacing: '2px',
                  fontFamily: 'monospace',
                }}
              >
                正在解析脑电波频段...
              </p>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.98 }}
              transition={shellTransition}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px',
              }}
            >
              <motion.div
                layout
                style={{
                  color: '#00ffcc',
                  fontSize: '1.28rem',
                  fontWeight: 'bold',
                  letterSpacing: '0.04em',
                  textShadow: '0 0 18px rgba(0,255,204,0.25)',
                  textAlign: 'center',
                }}
              >
                对方标签：{matchResult.label}
              </motion.div>

              <motion.div
                layout
                transition={shellTransition}
                style={{
                  width: '100%',
                  background: 'rgba(12,12,12,0.72)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(0,255,204,0.16)',
                  borderRadius: '24px',
                  padding: '28px 24px',
                  boxShadow: '0 18px 40px rgba(0,0,0,0.38)',
                }}
              >
                <div
                  style={{
                    color: '#f0f0f0',
                    fontSize: '1.06rem',
                    lineHeight: '1.7',
                    textAlign: 'center',
                    marginBottom: '24px',
                  }}
                >
                  雷达捕捉到一位同频用户，是否开启5分钟快闪交流？
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: 'rgba(0,255,204,0.18)',
                      boxShadow: '0 0 22px rgba(0,255,204,0.16)',
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleOpenChat}
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      borderRadius: '14px',
                      border: '1px solid rgba(0,255,204,0.25)',
                      background: 'rgba(0,255,204,0.1)',
                      color: '#dffff7',
                      fontSize: '0.98rem',
                      cursor: 'pointer',
                    }}
                  >
                    开启交流
                  </motion.button>
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: 'rgba(255,255,255,0.08)',
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSkipChat}
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      borderRadius: '14px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)',
                      color: '#c6c6c6',
                      fontSize: '0.98rem',
                      cursor: 'pointer',
                    }}
                  >
                    暂不开启
                  </motion.button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  {!hasSubmittedCorrection && (
                    <motion.button
                      type="button"
                      whileHover={{ color: 'rgba(210,210,210,0.96)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCorrectionToggle}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(150,150,150,0.88)',
                        padding: 0,
                        fontSize: '0.82rem',
                        letterSpacing: '0.04em',
                        cursor: 'pointer',
                      }}
                    >
                      标签不准？点击纠偏
                    </motion.button>
                  )}

                  <AnimatePresence mode="wait">
                    {showCorrectionOptions && !hasSubmittedCorrection && (
                      <motion.div
                        key="correction-options"
                        initial={{ opacity: 0, height: 0, y: -8 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -6 }}
                        transition={panelTransition}
                        style={{
                          overflow: 'hidden',
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        {['太中二了，换一个', '完全不感兴趣'].map((option) => (
                          <motion.button
                            key={option}
                            type="button"
                            whileHover={{
                              scale: 1.01,
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              borderColor: 'rgba(255,255,255,0.18)',
                            }}
                            whileTap={{ scale: 0.985 }}
                            onClick={handleCorrectionSubmit}
                            style={{
                              width: '100%',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: '#bcbcbc',
                              padding: '10px 12px',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              textAlign: 'left',
                              lineHeight: '1.4',
                            }}
                          >
                            {option}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}

                    {hasSubmittedCorrection && (
                      <motion.div
                        key="correction-confirmation"
                        initial={{ opacity: 0, height: 0, y: -6 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={panelTransition}
                        style={{ overflow: 'hidden', width: '100%' }}
                      >
                        <div
                          style={{
                            background: 'rgba(0,255,204,0.08)',
                            border: '1px solid rgba(0,255,204,0.16)',
                            borderRadius: '10px',
                            padding: '12px 14px',
                            color: '#63f4cb',
                            fontSize: '0.88rem',
                            lineHeight: '1.5',
                            textAlign: 'center',
                          }}
                        >
                          已调整推荐权重
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.98 }}
              transition={shellTransition}
              style={{ position: 'relative', minHeight: '560px' }}
            >
              <motion.div
                layout
                transition={shellTransition}
                style={{
                  background: 'rgba(10,10,10,0.76)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '26px',
                  padding: '22px',
                  boxShadow: '0 22px 48px rgba(0,0,0,0.42)',
                  backdropFilter: 'blur(18px)',
                  minHeight: '560px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    color: '#8d8d8d',
                    fontSize: '0.82rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '18px',
                    textAlign: 'center',
                  }}
                >
                  Echo 快闪通道
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, ...panelTransition }}
                    style={{ display: 'flex', justifyContent: 'center' }}
                  >
                    <div
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#a7a7a7',
                        fontSize: '0.84rem',
                        padding: '8px 12px',
                        borderRadius: '999px',
                      }}
                    >
                      [系统] 双向确认完成，共鸣通道已建立
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18, ...panelTransition }}
                    style={{ display: 'flex', justifyContent: 'flex-start' }}
                  >
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '420px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#ececec',
                        borderRadius: '18px 18px 18px 8px',
                        padding: '16px',
                      }}
                    >
                      <div style={{ color: '#8fb4aa', fontSize: '0.85rem', marginBottom: '8px' }}>
                        [Echo 引导员]
                      </div>
                      <div style={{ lineHeight: '1.6', marginBottom: selectedIcebreaker ? 0 : '14px' }}>
                        别紧张，我为你准备了几个破冰话题：
                      </div>

                      <AnimatePresence>
                        {!selectedIcebreaker && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={panelTransition}
                            style={{
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                            }}
                          >
                            {matchResult.icebreakers.map((text) => (
                              <motion.button
                                key={text}
                                whileHover={{
                                  scale: 1.01,
                                  backgroundColor: 'rgba(0,255,204,0.14)',
                                  borderColor: 'rgba(0,255,204,0.18)',
                                }}
                                whileTap={{ scale: 0.985 }}
                                onClick={() => handleIcebreakerSend(text)}
                                style={{
                                  background: 'rgba(0,255,204,0.07)',
                                  border: '1px solid rgba(0,255,204,0.12)',
                                  color: '#d7fffa',
                                  padding: '11px 12px',
                                  borderRadius: '12px',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  lineHeight: '1.45',
                                }}
                              >
                                {text}
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {selectedIcebreaker && (
                      <motion.div
                        initial={{ opacity: 0, x: 26, y: 12 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={panelTransition}
                        style={{ display: 'flex', justifyContent: 'flex-end' }}
                      >
                        <div
                          style={{
                            maxWidth: '360px',
                            background: 'linear-gradient(135deg, rgba(0,255,204,0.26), rgba(0,180,140,0.34))',
                            border: '1px solid rgba(0,255,204,0.28)',
                            color: '#effffb',
                            borderRadius: '18px 18px 8px 18px',
                            padding: '14px 16px',
                            boxShadow: '0 10px 24px rgba(0,255,204,0.08)',
                            lineHeight: '1.5',
                          }}
                        >
                          {selectedIcebreaker}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              <AnimatePresence>
                {showOutroCard && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 18 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 105, damping: 17 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '430px',
                        background: 'rgba(7,12,11,0.9)',
                        border: '1px solid rgba(0,255,204,0.18)',
                        borderRadius: '22px',
                        padding: '28px 24px',
                        textAlign: 'center',
                        color: '#e9fffb',
                        lineHeight: '1.8',
                        boxShadow: '0 24px 50px rgba(0,0,0,0.45)',
                        backdropFilter: 'blur(16px)',
                      }}
                    >
                      演示体验结束。AI 不代替人说话，只负责让人与人相遇。期待在共鸣中枢正式见。
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
