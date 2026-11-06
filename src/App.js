import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import UpdateLog from './components/UpdateLog';
import StatsCard from './components/StatsCard';
import WeatherEffects from './components/WeatherEffects';
import Runner from './components/Runner';
import CodeReview from './components/CodeReview';

// 발표형 슬라이드 스타일(큰 글씨, 화면 캡처 크기 고정)을 쓰는 프로젝트
const PRESENTATION_PROJECTS = ['eywa', 'ironfist'];

// 프로젝트 상세 모달: 기본 정보 ↔ 슬라이드 보기. Esc 키나 바깥 클릭으로 닫힌다.
const ProjectDetailModal = ({ projects, selectedProjectId, onClose }) => {
  const project = projects.find(p => p.id === selectedProjectId);
  
  const [currentView, setCurrentView] = useState('simple'); 
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0); 

  useEffect(() => {
    setCurrentView('simple');
    setCurrentSlideIndex(0); 

    // Escape 키를 누르면 모달을 닫는 이벤트 리스너 함수 정의
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose(); // 모달 닫기 함수 호출
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [selectedProjectId, onClose]);

  // 모달 외부 클릭 시 닫기 핸들러
  const handleOverlayClick = (event) => {
    // 이벤트 타겟(실제로 클릭된 요소)이 현재 타겟(이벤트 리스너가 달린 요소 = .modal-overlay)과 같으면
    // 즉, 모달의 내용이 아닌 오버레이 부분을 직접 클릭했을 때만 모달을 닫습니다.
    if (event.target === event.currentTarget) {
      onClose();
    }
  };



  // 프로젝트를 찾지 못하거나 슬라이드가 없는 경우 처리
  if (!project) {
    return null; 
  }

  const hasSlides = project.slides && project.slides.length > 0;
  const currentSlide = hasSlides ? project.slides[currentSlideIndex] : null;
  const totalSlides = hasSlides ? project.slides.length : 0;

  const handleNextSlide = () => {
    setCurrentSlideIndex((prevIndex) => Math.min(prevIndex + 1, totalSlides - 1));
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  return (
    // ✨ 이 div에 onClick 핸들러를 추가합니다. ✨
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        {/* 모달 닫기 버튼 */}
        <button className="modal-close-btn" onClick={onClose} aria-label="프로젝트 상세 닫기">
          <span aria-hidden="true">×</span>
        </button>
        
        {currentView === 'simple' ? (
          // ==============================
          // 💡 기본 상세 정보 뷰 (Simple Detail View) 💡
          // ==============================
          <div className="simple-detail-view">
            <h2 className="modal-title">{project.name}</h2>
            {project.thumbnail && <img src={project.thumbnail} alt={project.name} className="project-detail-image" />}
            
            <p className="project-detail-description">{project.description}</p>
            
            {project.fullDescription && (
              <div className="project-detail-full-description">
                <h4>상세 개요</h4>
                <p>{project.fullDescription}</p>
              </div>
            )}

            {hasSlides && (
              <button className="btn-primary view-slideshow-btn" onClick={() => setCurrentView('slideshow')}>
                PPT 형태로 보기
              </button>
            )}

            {/* 하단 '돌아가기' 버튼 (모달 전체 닫기) */}
            {/* <button className="modal-close-btn bottom-close-btn" onClick={onClose}>프로젝트 목록으로 돌아가기</button> */}
          </div>
        ) : (
          // ==============================
          // 💡 슬라이드 뷰어 (Slideshow View) 💡
          // ==============================
          <div className={`slideshow-view${PRESENTATION_PROJECTS.includes(project.id) ? ' eywa-presentation' : ''}`}>
            <div className="slideshow-header">
              <button className="back-to-detail-btn" onClick={() => setCurrentView('simple')}>
                <span aria-hidden="true">←</span> 기본 정보
              </button>
            </div>
            <h2 className="modal-title slide-present-title">{project.name} - 상세 발표</h2>

            <div className="project-slide-viewer">
              {/* 각 슬라이드 페이지 렌더링 */}

{currentSlide.type === 'title' && (
    <div className="slide slide-title-page">
      <h2 className="slide-main-title">{currentSlide.title}</h2>
      <p className="slide-subtitle">{currentSlide.subtitle}</p>
    </div>
)}
      {currentSlide.type === 'image_text' && (
                <div className="slide slide-image-text">
                  <h3 className="slide-title-sm">{currentSlide.title}</h3>
                  
                  {Array.isArray(currentSlide.images) && currentSlide.images.length > 0 ? (
                    <div className="multi-image-container">
                      {currentSlide.images.map((imgSrc, index) => (
                        <img 
                          key={index}
                          src={imgSrc}
                          alt={`${currentSlide.title}-${index}`}
                          className={`slide-image ${currentSlide.imageClassName || ''}`}
                          onClick={() => window.open(imgSrc, '_blank')} // ✨ 이미지 클릭 시 새 탭 열기 ✨
                          style={{ cursor: 'pointer' }} // ✨ 클릭 가능하다는 시각적 힌트 제공 ✨
                        />
                      ))}
                    </div>
                  ) : (
                    currentSlide.image && ( 
                      <img 
                        src={currentSlide.image} 
                        alt={currentSlide.title} 
                        className={`slide-image ${currentSlide.imageClassName || ''}`} 
                        onClick={() => window.open(currentSlide.image, '_blank')} // ✨ 이미지 클릭 시 새 탭 열기 ✨
                        style={{ cursor: 'pointer' }} // ✨ 클릭 가능하다는 시각적 힌트 제공 ✨
                      />
                    )
                  )}

      <p className={`slide-text ${currentSlide.contentClassName || ''}`} dangerouslySetInnerHTML={{ __html: currentSlide.content }}></p>
                </div>
              )}
{currentSlide.type === 'text' && (
    <div className="slide slide-text-only">
      <h3 className="slide-title-sm">{currentSlide.title}</h3>
      {currentSlide.content.split('\n').map((line, index) => ( // 줄바꿈 처리
        <p key={index} className="slide-text-line">{line}</p>
      ))}
    </div>
)}
              {currentSlide.type === 'tech_stack' && (
                <div className="slide slide-tech-stack">
                  <h3 className="slide-title-sm">{currentSlide.title}</h3>
                  <div className="slide-tech-list">
                    {project.techStack.map((tech, idx) => (
                      <span key={idx} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                  <p className="slide-text">{currentSlide.content}</p>
                </div>
              )}
              {currentSlide.type === 'links' && (
                <div className="slide slide-links">
                  <h3 className="slide-title-sm">{currentSlide.title}</h3>
                  <p className="slide-text">{currentSlide.content}</p>
                  <div className="project-detail-links">
                    {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn-modal-link">GitHub</a>}
                    {project.demo && <a href={project.demo} target="_blank" rel="noopener noreferrer" className="btn-modal-link">플레이해 보기</a>}
                  </div>
                </div>
              )}
            </div>

            {/* 슬라이드 네비게이션 */}
            <div className="slide-navigation">
              <button onClick={handlePrevSlide} disabled={currentSlideIndex === 0} className="slide-nav-btn">
                <span aria-hidden="true">←</span><span>이전</span>
              </button>
              <span className="slide-counter"><strong>{String(currentSlideIndex + 1).padStart(2, '0')}</strong><span> / {String(totalSlides).padStart(2, '0')}</span></span>
              <button onClick={handleNextSlide} disabled={currentSlideIndex === totalSlides - 1} className="slide-nav-btn">
                <span>다음</span><span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// =============================================================
// 🚀 메인 App 컴포넌트 🚀
// =============================================================
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null); 
    const contentRefs = useRef([]);
  let currentRefIndex = 9; // 첫 About 섹션에서 사용하는 0-8번 ref 다음 인덱스

useEffect(() => {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('is-exiting-left', 'is-exiting-right');
                    entry.target.classList.add('is-visible');
                } else {
                    entry.target.classList.remove('is-visible');
                    if (entry.target.classList.contains('about-intro')) {
                        const exitsAboveViewport = entry.boundingClientRect.top < entry.rootBounds.top;
                        entry.target.classList.toggle('is-exiting-left', exitsAboveViewport);
                        entry.target.classList.toggle('is-exiting-right', !exitsAboveViewport);
                    }
                }
            });
        },
        {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        }
    );

    // ✨✨✨ Netlify 로그와 ESLint 에러 해결을 위한 핵심 수정 부분 ✨✨✨
    // contentRefs.current의 현재 값을 캡처합니다.
    const refsSnapshot = contentRefs.current.filter(el => el !== null);

    refsSnapshot.forEach((el) => {
        observer.observe(el);
    });

    return () => {
        // 클린업 함수에서 캡처된 refsSnapshot을 사용합니다.
        refsSnapshot.forEach(el => {
            observer.unobserve(el);
        });
        observer.disconnect();
    };
}, []); // 의존성 배열은 비워두는 것이 이 로직에는 맞습니다.




  const projectsData = [
    {
      id: 'eywa',
      name: '프로젝트 1: EYWA 학원 관리 시스템',
      thumbnail: '/프론트.jpg',
      description: '학부모가 셔틀 등하원 정보를 확인하고 변경할 수 있도록 실제 운영 흐름을 개선한 학원 관리 시스템입니다.',
      fullDescription: 'EYWA는 학원 운영과 학생·학부모 관리를 위한 웹 시스템입니다. 저는 AI와 협업하며 학부모가 셔틀 노선을 확인하고 탑승 장소를 변경하는 흐름을 중심으로 기능을 구체화하고 개선했습니다.\n\n먼저 학부모 등하원 화면과 계정을 연결하고, 호차별 전체 노선을 확인하는 수정 모달을 구성했습니다. 회차와 정류장을 선택해 변경하는 흐름을 만든 뒤, 화면에만 반영되던 변경을 실제 데이터베이스 저장으로 확장했습니다. 정기 배정 변경, 결석·미탑승 처리와 사유 입력, 수정 이력 기록도 연결해 학부모의 변경 사항을 셔틀 담당자가 확인할 수 있도록 했습니다.\n\n운영 화면에는 변경 내역과 호차별 묶음 보기, 이름·초성 검색을 반영했습니다. 사용자 요구사항을 기능 단위로 나누고 AI와 구현·검토를 반복하면서, 화면 경험뿐 아니라 저장 흐름과 변경 이력까지 함께 다룬 작업입니다.',
      techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'SQL', 'Claude AI'],
      github: 'https://github.com/BIGSHOL/eywa',
      slides: [
        { type: 'title', title: 'EYWA 학원 관리 시스템', subtitle: '학부모 셔틀 이용 흐름 개선 · AI 협업 개발' },
        { type: 'text', title: '1. 프로젝트 개요', content: 'EYWA는 학원 운영과 학생·학부모 관리를 돕는 웹 시스템입니다.\n저는 그중 학부모가 셔틀 등하원 정보를 확인하고 변경하는 흐름을 중심으로 개선 작업에 참여했습니다.\n목표는 화면에서 선택한 변경이 실제 운영 데이터와 담당자 확인까지 이어지도록 만드는 것이었습니다.' },
        { type: 'text', title: '2. 담당 작업 한눈에 보기', content: '• 학부모 계정과 등하원 화면 연결\n• 호차·회차별 전체 노선 조회 모달 구성\n• 회차와 정류장을 선택하는 탑승 장소 변경 흐름 구현\n• 변경 정보의 실제 DB 저장과 정기 배정 변경 연결\n• 결석·미탑승 사유 입력 및 출발 10분 전 수정 제한\n• 변경 이력 기록과 직원용 변경 내역·검색 화면 구현' },
        { type: 'text', title: '3. 학부모 셔틀 화면 구현', content: '학부모 계정 화면에서 자녀의 요일별 등하원 정보를 확인하도록 연결했습니다.\n호차별 전체 노선과 회차를 모달에서 확인하고, 다른 호차로 전환하거나 회차를 선택해 탑승 장소를 변경하도록 구현했습니다.\n수정 모드에서만 노선 정보를 조회하도록 구성해 평소 화면의 불필요한 데이터 조회를 피했습니다.' },
        { type: 'image_text', title: '4. 실제 화면: 등하원 정보 확인', image: '/eywa-parent-rides.png', imageClassName: 'eywa-screen-image', content: '학부모가 요일별 셔틀 일정과 회차별 정류장을 확인하고, 등원·하원 변경 화면으로 이동하는 흐름입니다.' },
        { type: 'image_text', title: '5. 실제 화면: 호차별 전체 노선', image: '/eywa-shuttle-route.png', imageClassName: 'eywa-screen-image', content: '수정 모달에서 호차와 회차별 노선을 확인하고, 자녀가 탑승하거나 내리는 정류장을 한눈에 볼 수 있습니다.' },
        { type: 'text', title: '6. DB 저장과 변경 규칙', content: '화면에서 선택한 탑승 장소가 새로고침 후에도 유지되도록 변경 내용을 DB에 저장했습니다.\n요일별 정기 배정 변경, 결석, 등원·하원만 타지 않기와 사유 입력을 연결했습니다.\n회차 출발 10분 전부터는 해당 회차의 수정을 막고, 같은 마감 규칙을 화면과 서버에서 확인하도록 했습니다.' },
        { type: 'text', title: '7. 변경 이력과 직원용 관리', content: '변경·취소 때 행위자와 전후 내용을 이력으로 남겨 누가 언제 무엇을 바꿨는지 확인하도록 했습니다.\n직원 화면에 날짜별 변경 내역, 호차별 묶음 보기, 이름 및 초성 검색을 추가했습니다.\n학부모 화면에는 직원 메모와 내부 변경 이력이 전달되지 않도록 조회 범위를 분리했습니다.' },
        { type: 'text', title: '8. AI 협업 방식과 배운 점', content: 'AI와 함께 사용자 요청을 화면 동작, 저장 규칙, 예외 상황으로 나누고 각 단계를 기능으로 구현했습니다.\n초기 화면 중심의 변경 흐름을 실제 저장과 변경 이력까지 확장하며, 제안된 구현을 직접 확인하고 다음 개선점을 정해 반복했습니다.\nAI를 활용하면 아이디어를 빠르게 시험하고 구현할 수 있지만, 문제의 우선순위를 정하고 결과가 사용자 요구에 맞는지 판단하는 책임은 개발자에게 있다는 점을 배웠습니다.' },
        { type: 'tech_stack', title: '9. 기술 스택', content: '프로젝트에서 사용된 기술과 구현 영역입니다.' },
        { type: 'links', title: '10. 저장소', content: '여러 명이 함께 개발하는 팀 저장소입니다. 제가 작업한 학부모 등하원·셔틀 기능은 커밋 기록(작성자: 윤여원)에서 확인할 수 있습니다.' }
      ]
    },
    {
      id: 'ironfist',
      name: '프로젝트 2: IRON FIST 웹 3D 격투 RPG',
      thumbnail: '/ironfist-city.jpg',
      description: '브라우저에서 바로 즐기는 3D 격투 RPG입니다. 격투 대전, 필드 사냥, 보스 레이드에 서울 동네를 걷는 생활 모드와 실시간 멀티플레이까지 담았습니다.',
      fullDescription: 'IRON FIST는 설치 없이 웹 브라우저에서 바로 플레이하는 3D 격투 RPG입니다. 철권 같은 3D 격투 게임의 손맛을 웹에서 구현해 보고 싶어 시작했고, 지금도 계속 개발하고 있습니다.\n\n1:1 대전(VS CPU, 2P, 연습 모드), 몬스터를 자동으로 사냥하는 필드, 패턴과 분노 단계가 있는 보스 레이드를 만들었고, 레벨·경험치·골드는 하나의 프로필로 모든 모드가 함께 씁니다. 여기에 한강이 보이는 서울 동네를 걸으며 내 집(행복빌라)에 들어가고, 아르바이트·낚시·옷 가게·펫 키우기·코인노래방을 즐기는 생활 모드를 더했습니다. 동네에는 계절에 따라 비·눈·뇌우·안개가 바뀌는 날씨도 있습니다.\n\n로그인하면 기록이 Supabase 서버에 자동 저장되고, 같은 동네에 접속한 친구와 실시간으로 만나 함께 움직이고 겨룰 수 있습니다. 내가 보는 친구의 행동과 친구가 보는 내 행동이 같도록, 근무·낚시·잠자기·TV 시청 같은 행동도 서로의 화면에 똑같이 보이게 맞췄습니다. 게임 속 시각은 서버 시각에 맞춘 실제 한국 시각과 같고, 날씨·행인·자동차·신호등·경찰은 접속자 중 한 명의 브라우저가 계산해 나머지에게 보내므로 모든 사람이 같은 상황을 겪습니다. 동네 NPC와는 Claude API로 자유롭게 대화할 수 있습니다. 기획부터 구현, 테스트, 배포까지 AI(Claude Code)와 협업해 혼자 진행하고 있는 프로젝트입니다.',
      techStack: ['Next.js', 'TypeScript', 'Three.js', 'Supabase', 'Supabase Realtime', 'Claude API', 'Vercel'],
      github: 'https://github.com/dudnjs123456-blip/ONE',
      demo: 'https://tekken-web-five.vercel.app',
      slides: [
        { type: 'title', title: 'IRON FIST', subtitle: '웹 3D 격투 RPG · 기획부터 배포까지 AI 협업 개발 (진행 중)' },
        { type: 'text', title: '1. 프로젝트 개요', content: '설치 없이 브라우저에서 바로 플레이하는 3D 격투 RPG입니다.\n격투 대전 · RPG(필드 사냥, 보스 레이드) · 서울 생활 모드, 세 갈래로 구성했습니다.\n2026년 10월 시작해 현재 Vercel에 배포하고 기능을 계속 추가하고 있으며, 코드는 약 3만 줄 규모입니다.' },
        { type: 'image_text', title: '2. 실제 화면: 메인 메뉴', image: '/ironfist-menu.jpg', imageClassName: 'eywa-screen-image', content: '로그인하면 레벨과 골드, 클라우드 저장 상태를 보여 주고, 라이프 · RPG · 대전 모드를 고를 수 있습니다.' },
        { type: 'text', title: '3. 격투 엔진 설계', content: '게임 로직은 1/60초 고정 간격으로 진행하고, 화면 그리기와 분리했습니다.\n같은 입력이면 항상 같은 결과가 나오도록 만들었습니다. 덕분에 경기 중 입력만 녹화해 두었다가 그대로 다시 재생하는 리플레이 기능을 붙였고, 나중에 온라인 대전도 같은 방식으로 붙일 수 있습니다.\n기술은 발생·지속·후딜 프레임과 가드·히트 시 이득으로 정의하고, 상·중·하단 판정, 띄우기 콤보, 횡이동 회피를 구현했습니다.' },
        { type: 'image_text', title: '4. 실제 화면: 1:1 대전', image: '/ironfist-versus.jpg', imageClassName: 'eywa-screen-image', content: 'VRM 3D 캐릭터에 모션 캡처 애니메이션을 섞어 움직임을 표현했습니다. 화면 아래에는 방금 맞힌 기술의 판정과 데미지가 표시되고, 경기가 끝나면 준 데미지·맞힌 횟수·카운터·최대 콤보 같은 경기 통계를 보여 줍니다. 연습 모드에서는 추천 콤보를 캐릭터가 직접 시연하고, 방금 누른 방향·버튼과 프레임 수를 입력 기록으로 보여 주며, 내 동작을 5초 녹화하면 허수아비가 그대로 반복해 막기·반격을 연습할 수 있습니다. VS CPU에서 이기면 난이도별 점수가 쌓여 입문부터 철권왕까지 7단계 랭크가 오르고, 전적과 함께 계정에 저장됩니다.' },
        { type: 'image_text', title: '5. 실제 화면: 필드 사냥', image: '/ironfist-field.jpg', imageClassName: 'eywa-screen-image', content: '자동 사냥 AI가 몬스터를 찾아 싸우고, 경험치와 골드를 얻어 레벨업합니다. Z 키로 언제든 직접 조작으로 바꿀 수 있습니다. 보스 레이드에서는 아머·연타·분노 단계가 있는 보스 3종과 직접 싸웁니다.' },
        { type: 'image_text', title: '6. 실제 화면: 서울 생활 모드', image: '/ironfist-city.jpg', imageClassName: 'eywa-screen-image', content: '한강이 보이는 동네를 걸으며 횡단보도로 길을 건너고, 내 집이 있는 행복빌라에 들어갈 수 있습니다. 아파트 경비 아르바이트, 낚시, 옷 가게, 펫 돌보기, 게임 달력 등 생활 콘텐츠를 계속 늘려 가고 있습니다. 상가 코인노래방에서는 노래를 검색하면 유튜브에서 노래방 반주 영상을 찾아 틀어 주고, 예약 목록과 곡이 끝난 뒤 점수도 보여 줍니다. 날씨는 맑음·흐림·비·뇌우·눈·안개 6가지로, 달마다 잘 나오는 날씨가 다르고 게임 속 4시간마다 서서히 바뀝니다.' },
        { type: 'text', title: '7. 서버 연동과 멀티플레이', content: '아이디로 로그인하면 게임 기록이 Supabase 서버에 자동 저장되어, 다른 컴퓨터에서도 이어서 할 수 있습니다.\n같은 동네에 접속한 사람들을 Supabase Realtime으로 묶어, 친구의 위치·동작·옷차림이 실시간으로 보이고 서로 겨룰 수 있습니다.\n경비 데스크·소파처럼 한 명만 쓸 수 있는 자리는 먼저 차지한 사람만 쓰고, 근무 중인 로비 장면(주민·강도)과 집 TV 영상은 같은 공간에 있는 친구에게 같은 내용으로 보입니다.\n한 아이디는 한 창에서만 접속되도록 막아, 두 창에서 동시에 저장하다 기록이 꼬이는 문제를 방지했습니다.' },
        { type: 'text', title: '8. AI NPC 대화', content: '동네 NPC와 정해진 대사가 아니라 자유롭게 대화할 수 있도록 Claude API를 연결했습니다.\nAPI 키는 서버에만 두고, 브라우저에는 NPC의 대사만 돌려줍니다.\n답변은 대사·감정·호감도 형식으로 받아 서버에서 한 번 더 검사한 뒤 게임에 반영합니다.' },
        { type: 'text', title: '9. 검증 방식과 배운 점', content: '격투 엔진, 필드 사냥, 보스전, 도시, 저장, 멀티플레이, 낚시를 각각 화면 없이 자동으로 돌려 보는 검증 스크립트를 만들었습니다.\n예를 들어 잽이 가드당했을 때 +1, 맞혔을 때 +8 프레임 이득이 실제로 나오는지, 권장 레벨에서 보스를 이길 수 있는지 숫자로 확인합니다.\nAI와 함께 큰 규모의 게임을 만들면서, 기능을 작게 나누고 결과를 직접 확인하는 기준을 세우는 일이 코드를 빨리 쓰는 것보다 중요하다는 것을 배웠습니다.' },
        { type: 'tech_stack', title: '10. 기술 스택', content: 'Next.js와 Three.js로 3D 화면을, Supabase로 로그인·저장·실시간 통신을, Claude API로 NPC 대화를 구현했습니다.' },
        { type: 'links', title: '11. 직접 플레이해 보기', content: '아래 링크에서 바로 플레이해 보실 수 있고, 전체 코드는 GitHub에서 확인할 수 있습니다.' }
      ]
    },
    {
      id: 'albartoon',
      name: '프로젝트 3: 알바 근무 관리 플랫폼 알바툰',
      thumbnail: '/메인페이지.jpg',
      description: '알바툰은 자영업 가게 사장님과 아르바이트생 모두에게 실질적인 도움이 되고자 만든 근무 관리 플랫폼입니다.',
      fullDescription: '알바툰은 자영업 가게를 운영하는 사장님과 그곳에서 일하는 아르바이트생에게 실질적인 도움이 되고자 만들었습니다. 직접 아르바이트를 하면서 근태 관리, 근무일지, 시급 계산 같은 일을 여전히 손으로 기록하는 경우가 많고, 이를 체계적으로 관리해 주는 플랫폼은 찾기 어렵다고 느꼈습니다.\n\n기존 구인 플랫폼은 일자리를 찾는 단계에 초점이 맞춰져 있어, 실제로 일하는 동안의 출퇴근 기록이나 일정 공유까지는 다루지 않습니다. 알바툰은 이 빈자리를 채우는 것을 목표로 출근부, 일정표, 실시간 채팅, 게시판, 근무일지 기능을 만들고, 구인 공고 기능도 함께 넣어 사용자를 모을 수 있는 구조로 설계했습니다. 좋은 서비스는 사용자의 불편을 해결하는 동시에 지속 가능한 수익 구조까지 고민해야 한다고 생각했습니다.',
      techStack: ['React', 'Redux Toolkit', 'React Router', 'Node.js', 'Express', 'MySQL', 'Socket.IO', 'JWT'],
      github: 'https://github.com/dudnjs123456-blip/Albartoon',
      slides: [
        { type: 'title', title: '알바툰', subtitle: '알바 근무 관리 플랫폼' },
        { type: 'text', title: '1. 프로젝트 개요', content: '알바툰에 사용한 기술과, 그 기술이 실제 가게 운영에 어떻게 도움이 되는지, 생산성을 높이고 수익으로 이어지는 방법을 설명합니다.' },
        { type: 'tech_stack', title: '2. 기술 스택', content: 'React와 Redux Toolkit으로 화면과 상태를 관리하고, Node.js·Express 서버와 MySQL로 데이터를 저장했습니다. 로그인은 JWT, 실시간 채팅은 Socket.IO로 구현했습니다.'},
        { type: 'image_text', imageClassName: 'main-p1', images: [
          '/메인페이지.jpg',
          '/메인페이지하단.jpg'
        ], title: '3. 알바툰의 메인 화면과 구성', content: '알바툰은 업무를 돕는 기능, 가게별로 관리하는 기능, 가게와 아르바이트생을 이어 주는 구인 기능, 이렇게 세 가지 큰 틀로 나뉘어 있습니다.' },
        { type: 'image_text', title: '4. 유저 섹션', imageClassName: 'main-p2', images: [
          '/유저이력서.png',
          '/가게메인.jpg'
        ], content: '알바툰은 가게마다 하나의 페이지를 제공합니다. 가게 관리자인 사장님이 가게 정보를 등록하고, 구성원을 추가하거나 수정합니다. 개인 사용자는 마이페이지에서 자신의 정보를 수정하고 추가할 수 있습니다.'},
        { type: 'image_text', imageClassName: 'main-p3', contentClassName: 'albartoon-main-features', images: [
          '/가게출근부.png',
          '/가게일정표.png',
          '/가게채팅방.png',
          '/가게게시판내용.png',
          '/가게근무일지.png',
        ], title: '5. 알바툰의 주요 기능', content: `주요 기능은 모두 상단 메뉴에 모여 있습니다.
<br/><span class="highlight-num-1">첫 번째</span>는 알바툰의 핵심 기능인 출근부입니다. 가게에 속한 모든 사용자가 쓸 수 있고, 출근 버튼과 퇴근 버튼을 누를 때마다 기록이 DB에 저장되며 하루 단위로 초기화됩니다.
<br/><span class="highlight-num-2">두 번째</span>는 일정표입니다. 원하는 날짜에 일정을 적고 저장하면 가게 구성원 모두가 볼 수 있습니다.
<br/><span class="highlight-num-3">세 번째</span>는 채팅방입니다. 다른 기능은 하나의 서버를 거쳐 DB에 저장하지만, 실시간 대화를 위해 Socket.IO를 쓰는 채팅 전용 서버를 따로 두었습니다.
<br/><span class="highlight-num-4">네 번째</span>는 게시판입니다. 모든 구성원이 공지사항 같은 글을 올리고 볼 수 있습니다.
<br/><span class="highlight-num-5">마지막</span>은 근무일지 검색입니다. 관리자 권한이 있는 사람만 볼 수 있으며, 특정 날짜에 어떤 구성원이 얼마나 근무했는지 확인할 수 있습니다.`},
        { type: 'image_text', imageClassName: 'main-p4', images: [
          '/회원가입.jpg',
          '/로그인바.jpg',
          '/채팅방권한.jpg',
        ], title: '6. 회원가입·로그인과 접근 제어', content: '회원가입과 로그인 과정, 로그인하지 않은 상태에서 메뉴 기능을 눌렀을 때 접근을 막는 과정입니다. Node.js로 백엔드 서버를 구축하고 MySQL에 데이터를 저장했으며, JWT 토큰으로 로그인 여부를 확인해 기능별 접근 권한을 부여했습니다.'},
        { type: 'image_text', imageClassName: 'main-p5', images: [
          '/구인공고글.png',
          '/공고세션.png',
          '/공고카테고리.png',
        ], title: '7. 알바툰의 목표', content: '근무 관리 기능뿐 아니라 가게가 직접 구인 공고를 올리고, 사용자가 카테고리별로 공고를 보고 지원할 수 있도록 만들었습니다. 근무 관리와 구인을 한곳에서 해결해, 기존 구인 플랫폼과 차별화된 알바 플랫폼으로 자리 잡는 것이 알바툰의 목표입니다.'},
      ]
    },
    {
      id: 'youtube',
      name: '프로젝트 4: 드라마 쇼츠 유튜브 채널',
      thumbnail: '/유튜브메인.jpg',
      description: '웹 개발 외에 내가 가진 역량으로 어떤 성과를 낼 수 있을지 시험해 보려고 운영한 채널입니다. 최고 조회수 760만을 기록했습니다.',
      fullDescription: '이 채널은 웹 개발을 시작하기 전, 웹 디자인을 공부하면서 처음 만든 채널입니다. 포토샵과 일러스트레이터 외에 더 생산적인 결과를 낼 방법을 고민했고, 좋아하는 드라마의 장면을 쇼츠로 만들어 올려 보기로 했습니다.\n\n단순히 장면을 잘라 올리는 것으로는 경쟁력이 없다고 판단해, 업스케일링을 공부해서 화질을 최대한 끌어올린 쇼츠를 만들었습니다. 그 결과 최고 조회수 760만을 기록했습니다. 직접 만든 창작물이 아니어서 수익으로 이어지지는 않았지만, 유튜브라는 플랫폼이 어떻게 움직이는지, 어떻게 해야 수익을 낼 수 있는지 고민해 볼 수 있는 좋은 기회였습니다. 이렇게 여러 분야에 도전하며 배우는 자세가 실무에서도 큰 도움이 될 것이라 생각합니다.',
      techStack: ['Premiere Pro', '업스케일링', 'YouTube Shorts'],
      Url: 'https://www.youtube.com/@onein1004',
      slides: []
    },
  ];

  const handleProjectClick = (projectId) => {
    setSelectedProjectId(projectId); // 클릭된 프로젝트의 ID를 selectedProjectId에 저장
    setIsModalOpen(true); // 모달 열기
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false); // 모달 닫기
    setSelectedProjectId(null); // 선택된 프로젝트 ID 초기화
  };

  const name = "Yoon Yeo Won"; 
  return (
    <div className='portfolio-container'>
      <WeatherEffects />
      <div className="panel-dock-bar" aria-hidden="true" />
      <UpdateLog />
      <StatsCard />
      <Runner />
      
      {/* ============================================================= */}
      {/* 🚀 1. 헤더 (Header) 섹션 - 사이트의 얼굴, 내비게이션 🚀 */}
      {/* ============================================================= */}
      <header id="header" className="section-header">
        <div className="header-content">





<h1 className="site-title">
  {/* accessibility를 위해 전체 텍스트를 aria-label에 넣어줍니다. */}
  <span aria-label={name}>
    {name.split('').map((char, index) => (
      // 각 글자를 .letter 클래스의 span으로 감쌉니다.
      // 공백은 특수 공백 문자(&nbsp;에 해당)로 처리하여 CSS 애니메이션이 잘 적용되도록 합니다.
      <span key={index} className="letter" style={{ animationDelay: `${index * 0.08}s` }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))}
  </span>
</h1>
          <nav className="main-nav">
            <ul>
              <li><a href="#hero">Home</a></li>
              <li><a href="#about-skills">About & Skills</a></li>
              <li><a href="#projects">Projects</a></li>
              <li><a href="#code-review">Code Review</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* ============================================================= */}
      {/* 🌟 2. 히어로 섹션 (HeroSection) - 방문자를 사로잡는 첫인상 🌟 */}
      {/* ============================================================= */}
      <section id="hero" className="section-hero">
        <div className="hero-content">
          <div className="profile-image-wrap">
            <span className="profile-wave" aria-hidden="true" />
            <span className="profile-wave" aria-hidden="true" />
            <span className="profile-wave" aria-hidden="true" />
            <img src="/프론트1.png" alt="윤여원 프로필" className="profile-image" />
          </div>
          <p className="hero-subtitle" aria-label="안녕하세요!">
            {'안녕하세요!'.split('').map((char, index) => (
              <span
                className="greeting-letter"
                aria-hidden="true"
                key={`${char}-${index}`}
                style={{ animationDelay: `${index * 0.12}s` }}
              >
                {char}
              </span>
            ))}
          </p>
          <h2 className="hero-title">아이디어를 코드로 구현하는 <span className="highlight">프론트엔드 개발자</span> <span className="animated-name">윤여원</span>입니다!</h2>
          <p className="hero-description">사용자 경험을 최우선으로 생각하며, 끊임없이 배우고 성장하는 개발자입니다.</p>
          <a href="#projects" className="btn-primary">내 프로젝트 보러가기</a>
          <div className="social-links">
            <a href="https://github.com/dudnjs123456-blip" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
      </section>

          <section id="about-skills" className="section-about-skills">
      <div className="section-content">
        <h2 
          className="section-title content-item" 
          ref={el => contentRefs.current[0] = el} // 첫 번째 요소
          style={{ transitionDelay: '0s' }} // delay를 0s로 시작
        >
          나에 대해 & 나의 기술 스택
        </h2>
        
        <div className="about-me-content">
          <div
            className="about-intro content-item"
            ref={el => contentRefs.current[1] = el}
            style={{ transitionDelay: '0.1s' }}
          >
          <img
            src="/내사진.jpg"
            alt="윤여원 사진"
            className="about-me-image"
          />

          <p className="about-intro-copy">
            호기심이 많고 새로운 도전을 즐기는 저는 개발뿐만 아니라 다양한 분야에 관심이 많습니다. 특히 <span className="highlight">프리미어 프로를 이용한 쇼츠 편집</span>과 <span className="highlight">디자인 및 메인 페이지 꾸미기</span>에 깊은 흥미를 느끼고 있습니다. 최근에는 <span className="highlight">AI와 협업해 아이디어를 실제로 동작하는 서비스와 3D 웹 게임으로 만드는 일</span>에 몰두하고 있습니다. 이러한 활동들을 통해 눈에 보이는 결과물을 만드는 즐거움을 느끼고 있으며, 이런 경험이 창의적인 해결책을 찾는 데 도움이 된다고 믿습니다.
          </p>
          <p className="about-intro-copy">
            새로운 기술을 학습하고 적용하는 것을 좋아하며, 문제 해결 과정을 즐기는 개발자로서 끊임없이 성장하고 있습니다. 주변 사람들과의 소통과 협업을 중요하게 생각하며 긍정적인 에너지를 나누고자 노력합니다.
          </p>
          </div>

          <div 
            className="personal-info-list content-item"
            ref={el => contentRefs.current[4] = el} // 다섯 번째 요소
            style={{ transitionDelay: '0.4s' }} // 0.4초 뒤에 나타남
          >
              <h4>기본 정보</h4>
              <ul>
                  <li><strong>이름:</strong> 윤여원</li>
                  <li><strong>출생:</strong> 1998년생</li>
                  <li><strong>학력:</strong> 대구가톨릭대학교 컴퓨터공학과 (2025년 졸업)</li>
                  <li><strong>직무:</strong> 프론트엔드 개발자</li>
                  <li><strong>경력:</strong> 인재원 학원 근무 (2026년 8월 ~ 현재)</li>
                  <li><strong>거주지:</strong> 대구광역시</li>
                  <li><strong>관심 분야:</strong> 웹 개발, 웹 3D·게임, UX 디자인, 유튜브 콘텐츠 제작</li>
              </ul>
          </div>
          
        </div>

        <div className="skills-content">
          <h3 
            className="content-item"
            ref={el => contentRefs.current[5] = el} // 여섯 번째 요소
            style={{ transitionDelay: '0.5s' }} // 0.5초 뒤에 나타남
          >
            나의 기술 무기들
          </h3>
          <div 
            className="skill-category content-item"
            ref={el => contentRefs.current[6] = el} // 일곱 번째 요소
            style={{ transitionDelay: '0.6s' }} // 0.6초 뒤에 나타남
          >
            <h4>Languages</h4>
            <ul className="skill-list">
              <li>JavaScript (ES6+)</li>
              <li>TypeScript</li>
              <li>HTML5</li>
              <li>CSS3 </li>
            </ul>
          </div>
          <div 
            className="skill-category content-item"
            ref={el => contentRefs.current[7] = el} // 여덟 번째 요소
            style={{ transitionDelay: '0.7s' }} // 0.7초 뒤에 나타남
          >
            <h4>Frontend (프론트엔드) & Backend & API</h4>
            <ul className="skill-list">
              <li>React (Hooks, Context API)</li>
              <li>Next.js</li>
              <li>Redux Toolkit (상태 관리)</li>
              <li>React Router</li>
              <li>Tailwind CSS</li>
              <li>Three.js (웹 3D)</li>
              <li>Node.js</li>
              <li>Express (Node.js 프레임워크)</li>
              <li>Socket.IO / Supabase Realtime (실시간 통신)</li>
              <li>Supabase / PostgreSQL / MySQL</li>
              <li>SQL</li>
            </ul>
          </div>
          <div 
            className="skill-category content-item"
            ref={el => contentRefs.current[8] = el} // 아홉 번째 요소
            style={{ transitionDelay: '0.8s' }} // 0.8초 뒤에 나타남
          >
            <h4>Tools & Others</h4>
            <ul className="skill-list">
              <li>Git / GitHub</li>
              <li>VS Code</li>
              <li>RESTful API</li>
              <li>Vercel 배포</li>
              <li>AI 협업 개발 (Claude Code, Claude API)</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

      {/* ======================= 새로 추가되는 '프로젝트' 섹션 ======================= */}
      <section id="projects" className="section-projects">
        <div className="section-content">
          <h2
            className="section-title content-item"
            ref={el => contentRefs.current[currentRefIndex++] = el} // 이전 섹션에 이어서 인덱스 9부터 시작!
            style={{ transitionDelay: '0.9s' }} // 이전 요소보다 약간 뒤에 나타나도록
          >
            내 손으로 만든 프로젝트들
          </h2>
          <div className="projects-grid">
            {projectsData.map((project, index) => (
              <div
                key={project.id}
                className="project-card content-item"
                ref={el => contentRefs.current[currentRefIndex++] = el}
                style={{ transitionDelay: `${1 + index * 0.1}s` }}
                onClick={() => handleProjectClick(project.id)}
              >
                {project.thumbnail ? (
                  <img
                    src={project.thumbnail}
                    alt={project.name}
                    className={`project-thumbnail${project.id === 'eywa' ? ' eywa-project-thumbnail' : ''}`}
                  />
                ) : (
                  <div className="project-thumbnail project-ai-cover" aria-hidden="true">
                    <span>AI × FRONTEND</span>
                  </div>
                )}
                <h3 className="project-title">{project.name}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-tech-stack">
                  {project.techStack.map(tech => <span key={tech}>{tech}</span>)}
                </div>
                {(project.github || project.demo || project.Url) && (
                  <div className="project-links">
                    {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn-secondary" onClick={event => event.stopPropagation()}>GitHub</a>}
                    {project.demo && <a href={project.demo} target="_blank" rel="noopener noreferrer" className="btn-secondary" onClick={event => event.stopPropagation()}>플레이하기</a>}
                    {project.Url && <a href={project.Url} target="_blank" rel="noopener noreferrer" className="btn-secondary" onClick={event => event.stopPropagation()}>YouTube Channel</a>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

     <section id="post-project-review" className="section-post-review">
        <div className="section-content">
          <h2
            className="section-title content-item"
            ref={el => contentRefs.current[currentRefIndex++] = el}
            style={{ transitionDelay: '0.9s' }} // 이전 섹션의 마지막 딜레이에 이어지는 값 (조정 필요)
          >
            프로젝트를 만들고 난 후기
          </h2>
          <div className="review-content">
            <p
              className="content-item"
              ref={el => contentRefs.current[currentRefIndex++] = el}
              style={{ transitionDelay: '1.0s' }}
            >
              '알바툰' 프로젝트를 처음 시작했을 때는 웹에 글자 하나 띄우는 것만으로도 신기하고 재미있었습니다. 그 재미가 제가 이 분야에 들어오게 된 큰 계기입니다.
              개발을 '업'으로 생각하고 실제 문제들을 마주하면서, <span className="review-growth-highlight">하고 싶은 일만 좇는 것이 아니라 맡은 일을 끝까지 해내는 '책임감'이 가장 중요하다는 것을 깊이 깨달았습니다.</span>
              회사에서는 하고 싶은 일보다 해야 하는 일을 마주하는 순간이 훨씬 많을 것입니다. 그런 상황에 처했을 때도 피하지 않고 문제를 끝까지 해결해 나가겠습니다.
            </p>

            <p
              className="content-item"
              ref={el => contentRefs.current[currentRefIndex++] = el}
              style={{ transitionDelay: '1.1s' }}
            >
              프로젝트를 진행하며 마주한 많은 문제 속에서 <span className="review-ai-highlight">AI는 문제 해결의 속도와 생산성을 크게 높여 주었습니다.</span> 다만 AI가 만든 코드를 그대로 쓰지 않고, 왜 그렇게 동작하는지 이해하고 직접 확인한 뒤에 반영하는 것을 원칙으로 삼았습니다. 그리고 현대 개발자에게는 코드 작성 능력과 함께 <span className="review-strength-highlight">'큰 그림을 그리는 능력'과 '실질적인 비즈니스 가치를 만드는 능력'</span>이 중요하다고 생각합니다.
              '이 기능이 사용자와 회사에 어떤 도움이 될까?', '어떻게 하면 서비스의 생산성을 높일 수 있을까?'와 같은 비즈니스 관점의 고민을 꾸준히 해 왔고, 이것이 저의 강점이라고 생각합니다.
            </p>

            <p
              className="content-item"
              ref={el => contentRefs.current[currentRefIndex++] = el}
              style={{ transitionDelay: '1.2s' }}
            >
              알바툰은 처음부터 혼자 만든 프로젝트로, 아직 완성되지 않았습니다. 혼자서 기획, 화면, 서버, 데이터베이스까지 모두 다뤄 보면서 웹 서비스 하나를 완성하는 데 얼마나 많은 일이 필요한지 알게 되었고, <span className="review-collaboration-highlight">협업의 중요성</span>을 몸소 체험했습니다.
              실무 협업은 아직 경험이 많지 않지만, 협업의 가치를 잘 알기에 적극적으로 배우고 기여하며 성장하겠습니다.
            </p>

            <p
              className="content-item"
              ref={el => contentRefs.current[currentRefIndex++] = el}
              style={{ transitionDelay: '1.3s' }}
            >
              EYWA 학원 관리 시스템의 셔틀 기능을 개선하며, 저는 <span className="review-ai-highlight">AI와 대화해 사용자의 불편을 구체적인 기능으로 바꾸고, 아이디어를 실제 동작하는 코드로 구현하는 과정</span>을 경험했습니다. 학부모가 노선을 확인하고 탑승 장소를 바꾸는 흐름을 함께 설계한 뒤, 데이터 저장과 변경 이력까지 단계적으로 연결했습니다. 원하는 결과가 나올 때까지 AI와 구현 방향을 조정하고, 화면과 동작을 확인해 다시 개선하는 과정을 반복했습니다.
              <span className="review-growth-highlight"> AI가 제안한 코드를 그대로 받아들이는 데 그치지 않고, 무엇을 만들지 결정하고 결과를 검토하며 다음 개선점을 찾는 주체는 저였습니다.</span> 이 경험을 통해 AI를 활용한 개발은 더 빠르게 코드를 만드는 것뿐 아니라, 더 많은 해결 방법을 시도하고 아이디어를 끝까지 구체화하는 일이라는 것을 배웠습니다.
            </p>

            <p
              className="content-item"
              ref={el => contentRefs.current[currentRefIndex++] = el}
              style={{ transitionDelay: '1.4s' }}
            >
              지금은 웹 3D 격투 RPG <span className="review-ai-highlight">'IRON FIST'</span>를 개발하고 있습니다. 브라우저에서 3D 캐릭터가 싸우고, 친구와 실시간으로 같은 동네를 돌아다니는 게임을 만들면서 웹이 할 수 있는 일의 범위가 생각보다 훨씬 넓다는 것을 느꼈습니다. 기능이 많아질수록 한 곳을 고쳤을 때 다른 곳에 문제가 생기지 않는지 확인하는 일이 중요해졌고, 그래서 격투 판정, 보스 밸런스, 저장, 멀티플레이를 화면 없이 자동으로 검증하는 테스트를 만들어 변경할 때마다 확인했습니다.
              <span className="review-growth-highlight"> 만들고 싶은 것을 끝까지 만들어 실제로 배포하고, 직접 플레이하며 고쳐 나가는 과정</span>이 개발자로서 가장 즐겁고 크게 성장하는 순간이라는 것을 다시 한번 느끼고 있습니다.
            </p>

            <p
              className="content-item"
              ref={el => contentRefs.current[currentRefIndex++] = el}
              style={{ transitionDelay: '1.5s' }}
            >
              마지막으로 저는 <span className="review-innovation-highlight">끊임없이 배우고 늘 새로운 시도를 추구합니다.</span> 유튜브 채널 활동이 이런 성향을 잘 보여 줍니다. '어떻게 하면 적은 자원으로 큰 결과를 낼 수 있을까?'라는 고민 끝에 드라마 쇼츠의 화질을 업스케일링으로 최대한 끌어올리는 시도를 했고, 당시에는 흔치 않던 방식으로 최고 760만 조회수를 기록했습니다. 수익으로 이어지지는 않았지만, 새로운 시도에 대한 반응을 분석하며 인사이트를 얻은 값진 경험이었습니다.
              저는 현재 <span className="review-frontend-developer">프론트엔드 개발자</span>이지만, 단순히 기술에만 국한되지 않는 <span className="review-potential">무궁무진한 가능성을 가진 '윤여원'</span>이라는 사람을 소개하고 싶습니다! 감사합니다😊
            </p>
          </div>
        </div>
      </section>

      {/* ======================= 코드 리뷰 (매일 밤 Claude 가 그날 커밋을 리뷰해 Supabase 에 올린 글) ======================= */}
      <section id="code-review" className="section-code-review">
        <div className="section-content">
          <h2
            className="section-title content-item"
            ref={el => contentRefs.current[currentRefIndex++] = el}
            style={{ transitionDelay: '0.2s' }}
          >
            코드 리뷰
          </h2>
          <p
            className="cr-desc content-item"
            ref={el => contentRefs.current[currentRefIndex++] = el}
            style={{ transitionDelay: '0.3s' }}
          >
            매일 밤 AI(Claude)가 그날 GitHub 에 올라온 커밋을 읽고, 고쳐야 할 부분과 눈여겨볼 코드를 골라 리뷰합니다.
          </p>
          <CodeReview />
        </div>
      </section>

      {/* ======================= 새로 추가되는 '연락처' 섹션 ======================= */}
      <section id="contact" className="section-contact">
        <div className="section-content">
          <h2
            className="section-title content-item"
            ref={el => contentRefs.current[currentRefIndex++] = el}
            style={{ transitionDelay: '1.6s' }}
          >
            저와 함께 성장할 준비가 되셨나요?
          </h2>
          <p
            className="contact-description content-item"
            ref={el => contentRefs.current[currentRefIndex++] = el}
            style={{ transitionDelay: '1.7s' }}
          >
            궁금한 점이 있거나, 함께 일하고 싶으시다면 언제든지 편하게 연락 주세요!
          </p>
          <div
            className="contact-info content-item"
            ref={el => contentRefs.current[currentRefIndex++] = el}
            style={{ transitionDelay: '1.8s' }}
          >
            <p><strong>Email:</strong> <a href="mailto:ghkfkddlqtl@naver.com">ghkfkddlqtl@naver.com</a></p>
            <p><strong>GitHub:</strong> <a href="https://github.com/dudnjs123456-blip" target="_blank" rel="noopener noreferrer">github.com/dudnjs123456-blip</a></p>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="section-footer">
        <p>&copy; {new Date().getFullYear()} <span className="animated-name">윤여원</span>. All rights reserved.</p>
        <p>Made with ❤️ using React</p>
      </footer>

      {/* 모달 렌더링 */}
      {isModalOpen && selectedProjectId && (
        <ProjectDetailModal 
          projects={projectsData} 
          selectedProjectId={selectedProjectId} 
          onClose={handleCloseModal} 
        />
      )}

    </div>
  );
}

export default App;