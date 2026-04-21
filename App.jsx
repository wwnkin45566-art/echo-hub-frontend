import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EchoHubMVP() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [matchResult, setMatchResult] = useState({ label: '', icebreakers: [] });

  useEffect(() => {
    const handleMouseMove = (e) =>
      setMousePosition({ x: e.clientX, y: e.clientY });

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  const handleAnswer = async (optionText) => {
    const newAnswers = [...answers, optionText];
    setAnswers(newAnswers);

    if (newAnswers.length < questions.length) {
      return;
    }

    setStep(2);

    try {
      const response = await fetch(https://echo-hub-backend.onrender.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: newAnswers }),
      });

      const data = await response.json();

      setMatchResult({
        label: data.label || '未知的流浪者',
        icebreakers: data.icebreakers || ['雷达信号微弱，要不你先打个招呼？'],
      });
      setStep(3);
    } catch (error) {
      console.error('雷达连接断开:', error);
      alert('连接后端失败了！请检查你的终端里 Python 服务是否还在运行哦。');
      setAnswers([]);
      setStep(1);
    }
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

      <div style={{ zIndex: 10, width: '100%', maxWidth: '500px', padding: '20px' }}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 style={{ color: '#fff', marginBottom: '30px', textAlign: 'center' }}>
                {questions[answers.length]?.title}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {questions[answers.length]?.options.map((opt, i) => (
                  <motion.button
                    key={i}
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
              layout
              onClick={() => setIsExpanded(!isExpanded)}
              initial={{ opacity: 0, scale: 0.9, borderRadius: '24px' }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: 'rgba(20,20,20,0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0,255,204,0.2)',
                padding: '40px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              }}
            >
              <motion.h2
                layout="position"
                style={{ color: '#fff', margin: 0, fontFamily: 'monospace' }}
              >
                ✨ 发现同频信号
              </motion.h2>
              <motion.p
                layout="position"
                style={{
                  color: '#00ffcc',
                  marginTop: '10px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                }}
              >
                对方标签：{matchResult.label}
              </motion.p>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: '30px' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden', width: '100%' }}
                  >
                    <div
                      style={{
                        background: '#111',
                        borderRadius: '12px',
                        padding: '16px',
                        color: '#aaa',
                        fontSize: '0.9rem',
                        marginBottom: '20px',
                      }}
                    >
                      [系统] 共鸣通道已建立，AI 已为你生成以下破冰话题：
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {matchResult.icebreakers.map((text, i) => (
                        <motion.button
                          key={i}
                          whileHover={{
                            scale: 1.02,
                            backgroundColor: 'rgba(0,255,204,0.15)',
                          }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#eee',
                            padding: '12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            lineHeight: '1.5',
                          }}
                        >
                          {text}
                        </motion.button>
                      ))}
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
