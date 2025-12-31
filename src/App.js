// src/App.js

import React, { useState, useEffect } from 'react'; // useEffect 훅 추가
import './App.css'; // App.css 파일을 임포트합니다.

// =============================================================
// ✨ ProjectDetailModal 컴포넌트 (App.js 파일 내부에 정의) ✨
// 이제 selectedProjectId prop을 받아서 해당 프로젝트의 슬라이드를 보여줍니다.
// =============================================================
// src/App.js 파일 내 ProjectDetailModal 컴포넌트 부분

// (주의: 아래 두 import 문은 App.js 파일의 최상단에 이미 존재해야 합니다.)
// import React, { useState, useEffect } from 'react'; 
// import './App.css'; 

// =============================================================
// ✨ ProjectDetailModal 컴포넌트 (App.js 파일 내부에 정의) ✨
// Escape 키 및 모달 외부 클릭으로 닫기 기능 추가 완료!
// =============================================================
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
        <button className="modal-close-btn" onClick={onClose}>닫기</button>
        
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

            {/* 프로젝트 1이고 슬라이드가 있는 경우에만 '상세 보기 (슬라이드)' 버튼을 보여줍니다. */}
            {project.id === 'project1' && hasSlides && (
              <button className="btn-primary view-slideshow-btn" onClick={() => setCurrentView('slideshow')}>
                PPT 형태로 상세 설명 보기
              </button>
            )}

            {/* 하단 '돌아가기' 버튼 (모달 전체 닫기) */}
            {/* <button className="modal-close-btn bottom-close-btn" onClick={onClose}>프로젝트 목록으로 돌아가기</button> */}
          </div>
        ) : (
          // ==============================
          // 💡 슬라이드 뷰어 (Slideshow View) 💡
          // ==============================
          <div className="slideshow-view">
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

      <p className="slide-text" dangerouslySetInnerHTML={{ __html: currentSlide.content }}></p>
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
                    {/* {project.demo && <a href={project.demo} target="_blank" rel="noopener noreferrer" className="btn-modal-link">Demo</a>} */}
                  </div>
                </div>
              )}
            </div>

            {/* 슬라이드 네비게이션 */}
            <div className="slide-navigation">
              <button onClick={handlePrevSlide} disabled={currentSlideIndex === 0} className="slide-nav-btn">이전</button>
              <span>{currentSlideIndex + 1} / {totalSlides}</span>
              <button onClick={handleNextSlide} disabled={currentSlideIndex === totalSlides - 1} className="slide-nav-btn">다음</button>
            </div>
            
            {/* 하단 '돌아가기' 버튼 (기본 상세 화면으로 돌아가기) */}
            <button className="modal-close-btn bottom-close-btn" onClick={() => setCurrentView('simple')}>기본 정보로 돌아가기</button>
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

  const projectsData = [
    {
      id: 'project1',
      name: '프로젝트 1: 알바계의 새로운 플랫폼 알바툰',
      thumbnail: '/메인페이지.png',
      description: '알바툰은 자영업 가게와 아르바이트를 하는 모두에게 실질적인 도움이 되고자 만든 프로젝트입니다.',
      fullDescription: '알바툰은 자영업가게를 운영하시는 사장님과 그곳에서 일하는 아르바이트를 하시는 분들에게 실질적인 도움이 되고자 만들게 되었습니다. 저도 아르바이트를 해오면서 수기로 체크하는 근태관리, 나의 근무일지, 나의 시급계산 등등 여러가지 부분들이 아직 이 알바 생태계에선 수기로 하는 부분들이 많고 명확한 틀이 갖춘 플랫폼도 없다고 생각했습니다. 지금 있는 알바몬, 알바천국은 구인공고에만 도움이 되지 실질적으로 일하는분들에겐 어떠한 도움도 주지 못합니다. 저는 그문제점을 해결하고 싶었습니다. 앞서 말햇듯 이미 두 플랫폼이 알바라는 생태계의 거장이기에 이곳의 파이를 가져오기 위한 충분한 도구로서도 작용할거라 생각하고 그것을 바탕으로 수익화까지 할수 있어야 요즘 시대에 필요한 개발자의 덕목이라고 생각합니다.',
      techStack: ['React', 'Node.js', 'Mysql', 'Express', 'JWT'],
      github: 'https://github.com/dudnjs123456-blip/introduce',
      slides: [ // 약 10페이지 가량의 슬라이드
        { type: 'title', title: '알바툰', subtitle: '실질적 알바 플랫폼' }, // 1페이지
        { type: 'text', title: '1. 프로젝트 개요', content: '이 프로젝트를 만들면서 들어간 기술들, 그 기술들을 통해 실무적인 측면에 어떻게 도움이 될것인지 그리고 그로 인해 얼마나 생산성을 높이고 수익화를 시킬 것인지 설망하는 개요입니다.' }, // 2페이지
        // { type: 'text', title: '3. 주요 기능 및 기대 효과', content: '- 실시간 재고 현황 조회: 정확한 재고 파악\n- 품목별 입출고 관리: 체계적인 기록 및 추적\n- 판매량 기반 자동 재고 예측: 효율적인 발주\n- 데이터 시각화 대시보드: 한눈에 보는 현황\n- 사용자별 권한 관리: 보안 및 책임 명확화\n기대 효과: 운영 비용 80% 절감, 재고 정확도 95% 향상.' }, // 4페이지
        { type: 'tech_stack', title: '2. 기술 스택', content: '프론트엔드, 백엔드, 데이터베이스 및 인증 방식을 선택한 이유와 프로젝트에서의 활용 방안을 상세히 설명합니다.'}, // 5페이지
        // { type: 'image_text', image: 'project1_architecture.jpg', title: '5. 시스템 아키텍처', content: 'React와 Node.js 기반의 RESTful API 연동 아키텍처. MongoDB로 유연한 데이터 모델링. 안정성과 확장성을 고려하여 설계되었습니다.' }, // 6페이지 (이미지는 임시)
        // { type: 'text', title: '6. 개발 과정 및 개인 역할', content: '프로젝트 기획, UI/UX 설계, 프론트엔드 개발(React 컴포넌트, 상태 관리), 백엔드 API 개발(CRUD, 인증), 테스트, 배포에 이르기까지 전반적인 과정에 참여했습니다. 특히 팀 리더로서 Git Flow 기반의 협업을 주도하고 코드 리뷰를 진행했습니다.' }, // 7페이지
        // { type: 'text', title: '7. 주요 도전 과제 및 해결 방안', content: '- 복잡한 재고 로직 구현: 다수의 조건과 예외를 고려한 비즈니스 로직 설계 및 테스트 코드 작성\n- 실시간 데이터 동기화: WebSocket (Socket.IO)을 도입하여 클라이언트-서버 간 데이터 동기화 구현\n- 성능 최적화: 번들 사이즈 감소(Webpack), 이미지 최적화, 불필요한 렌더링 방지(React.memo) 등을 적용하여 페이지 로딩 속도 개선.' }, // 8페이지
        { type: 'image_text',imageClassName: 'main-p1' ,     images: [
          '/메인페이지.png', 
          '/메인페이지하단.png'  
        ], title: '3. 알바툰의 메인화면 및 프로세스', content: '알바툰은 업무 테스킹에 도움되는 프로세스, 가게마다 관리할 수 있는 프로세스, 가게와 아르바이트생들에게 구인에 도움이 되는 프로세스 총 3가지의 큰틀로 나눠져있습니다.' }, // 3페이지 (이미지는 임시)
        { type: 'image_text',  title: '4. 유저 섹션'  ,imageClassName: 'main-p2' ,images: [
          '/유저이력서.png',  
          '/가게메인.png'   
        ],content: ' 저희 페이지는 가게마다 하나의 페이지를 제공합니다. 그곳의 메인 관리자 사장님이 가게의 정보를 제공하게 하고 가게 구성원들을 선택하여 인원을 추가,수정합니다, 그리고 개인 유저들은 마이페이지를 통해 본인의 데이터를 수정 및 추가 할 수 있습니다.. '}, // 9페이지 (이미지는 임시)
        { type: 'image_text',imageClassName: 'main-p3',    images: [
          '/가게출근부.png',
          '/가게일정표.png',
          '/가게채팅방.png',
          '/가게게시판내용.png',
          '/가게근무일지.png',  
        ], title: '5. 알바툰의 메인기능.' ,content: `실기능을 하는 섹션들은 Nav안에 다 모여있는데
<br/><span class="highlight-num-1">첫번째</span> 알바툰의 메인 기능인 출근부입니다, 이 기능은 하루마다 리셋이 되며 그 가게에 속해 있는 모든 유저가 사용가능하며 출근 버튼을 누르는 순간 저장이 되고 퇴근 버튼까지 누르면 다시 DB에 저장 되는 기능을 가지고 있습니다.
<br/><span class="highlight-num-2">두번째</span> 스케줄러입니다, 이 기능 또한 가게에 속한 모두가 사용할 수 있으며 원하는 날짜에 내용을 담고 저장을 누르면 모두가 열람 가능한 시스템입니다.
<br/><span class="highlight-num-3">세번째</span> 채팅방입니다, 이전까지는 다른 통합서버를 통해 DB에 저장하고 했지만 이 기능은 실시간 채팅 기능을 위해 socket.io를 사용하였고 별도로 다른 서버가 하나더 있습니다, 그로 인해 실시간 대화가 가능하도록 구현했습니다.
<br/><span class="highlight-num-4">네번째</span> 게시판 기능입니다, 이 기능은 전과 동일하게 모든 유저가 사용가능하며 공지해야하는 글이나 올릴 수 있는 기능입니다.
<br/><span class="highlight-num-5">마지막은</span> 근무일지 검색 기능입니다, 이 기능은 관리자 권한을 가진 사람만 열람가능하며 특정 날짜에 어떤 멤버가 얼마나 근무를 하였는지 체크 가능한 기능입니다.`}, 
        { type: 'image_text', imageClassName: 'main-p4',    images: [
            '/회원가입.png',
          '/로그인바.png',
          '/채팅방권환.png',
        ], title: '6. 유저 접근 및 접근 통제' ,content: ' 유저들이 맨 처음 회원가입을 하는 과정, 로그인을 하지 않은 상태에서 네브바에 있는 기능들을 눌렀을때 통제하는 과정, 로그인을 하는 과정, Node.js로 백엔드 서버를 구축하고, Mysql 워크벤치를 이용하여 DB데이터를 저장했습니다. 그후 JWT토큰을 통해 유저가 로그인을 했는지 판별하고 위 기능에 접속 권한을 줍니다.'}, // 9페이지 (이미지는 임시)
        { type: 'image_text', imageClassName: 'main-p5',    images: [
            '/구인공고글.png',
          '/공고세션.png',
          '/공고카테고리.png',
        ], title: '7. 알바툰의 목표' ,content: '실질적기능뿐 아니라 자체적으로 구인공고글을 올릴 수 있게 만든 후, 카테고리를 유저들이 보고 지원할 수 있게 구축하였습니다, 이러한 시스템들을 기반으로 알바 생태계에 새로운 파이를 잡아 먹는것이 알바툰의 핵심 목표입니다.'}, // 9페이지 (이미지는 임시)
      ]
    },
    {
      id: 'project2',
      name: '프로젝트 2: 나만의 유튜브 채널',
      thumbnail: '/유튜브메인.png',
      description: '웹 개발뿐 아니라 내가 가진 카드들중 어떻게 좀더 생산성 있는 방향으로를 나아갈 수 있을까 해서 만든 채널입니다.',
      fullDescription: '이 유튜브 채널은 제가 웹 개발을 하기전에 웹 디자인을 공부하면서 처음 만들었던 채널입니다, 그때 전 포토샵, 일러스트 뿐아니라 좀더 생산성을 낼 수 있는 무언가가 있지 않을까 고민했고 그 결과가 내가 좋아하는 드라마들의 쇼츠를 따서 올려보는것이었습니다. 하지만 그냥 올리는것은 강점이 없다 생각했기에 제가 할수 있는 한 화질을 최대한 올리고 업스케일링을 공부하여 쇼츠를 만들어 올린 결과 최대 조회수 760만이라는 결과물을 얻었습니다, 물론 이것은 제가 만든 창작물이 아니라 수익화까진 가지 못했지만 이런 경험을 통해 유튜브 생태계는 어떤곳인지 깨달았고 이것을 어떻게 해야 수익화를 할 수 있는지 고민할수있는 좋은기회였다고 생각합니다. 이렇게 웹 개발뿐아니라 여러가지 분야에 도전하는것에 흥미를 느끼고 늘 배우는 자세가 실무에 있어서 큰 도움이 될것이라 생각합니다.',
      techStack: ['Youtube'],
      Url: 'https://www.youtube.com/@onein1004',
      slides: [] // 프로젝트 2는 슬라이드가 없으므로 빈 배열로 둡니다.
    }
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

  return (
    <div className='portfolio-container'> 
      
      {/* ============================================================= */}
      {/* 🚀 1. 헤더 (Header) 섹션 - 사이트의 얼굴, 내비게이션 🚀 */}
      {/* ============================================================= */}
      <header id="header" className="section-header">
        <div className="header-content">
          <h1 className="site-title"><span>Yoon Yeo Won</span></h1>
          <nav className="main-nav">
            <ul>
              <li><a href="#hero">Home</a></li>
              <li><a href="#about-skills">About & Skills</a></li>
              <li><a href="#projects">Projects</a></li>
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
          {/* <img src="profile_photo.jpg" alt="Your Profile" className="profile-image" /> */}
          <p className="hero-subtitle">안녕하세요!</p>
          <h2 className="hero-title">아이디어를 코드로 구현하는 <span className="highlight">프론트엔드 개발자</span> <span className="animated-name">윤여원</span>입니다!</h2>
          <p className="hero-description">사용자 경험을 최우선으로 생각하며, 끊임없이 배우고 성장하는 개발자입니다.</p>
          <a href="#projects" className="btn-primary">내 프로젝트 보러가기</a>
          <div className="social-links">
            <a href="https://github.com/dudnjs123456-blip/introduce" target="_blank" rel="noopener noreferrer">GitHub</a>
            {/* <a href="https://www.linkedin.com/in/your-linkedin" target="_blank" rel="noopener noreferrer">LinkedIn</a> */}
            {/* 다른 소셜 링크 추가 */}
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* 🙋‍♀️ 3. 나에 대해 & 기술 스택 (AboutAndSkills) - 너의 이야기와 무기들 🛠️ */}
      {/* ============================================================= */}
      <section id="about-skills" className="section-about-skills">
        <div className="section-content">
          <h2 className="section-title">나에 대해 & 나의 기술 스택</h2>
          
          <div className="about-me-content">
            <h3>나란 사람에 대해</h3>
            
            <img src="내사진.jpeg" alt="About Me" className="about-me-image" />
            
            <p>호기심이 많고 새로운 도전을 즐기는 저는 개발뿐만 아니라 다양한 분야에 관심이 많습니다. 특히 <span className="highlight">[프리미어 프로를 이용한 쇼츠 편집]</span>과 <span className="highlight">[디자인 및 메인 페이지 꾸미기]
              </span>에 깊은 흥미를 느끼고 있습니다. 이러한 활동들을 통해 시각적으로 매력적인 결과물을 만드는 즐거움을 느끼고 있습니다. 제 삶의 이러한 경험이 결국 더 나은 앞길을 제시하고 창의적인 해결책을 찾는 데 도움이 된다고 믿습니다.</p>
            <p>새로운 기술을 학습하고 적용하는 것을 좋아하며, 문제 해결 과정을 즐기는 개발자로서 끊임없이 성장하고 있습니다. 주변 사람들과의 소통과 협업을 중요하게 생각하며 긍정적인 에너지를 나누고자 노력합니다.</p>

            <div className="personal-info-list">
                <h4>기본 정보</h4>
                <ul>
                    <li><strong>이름:</strong> 윤여원</li>
                    <li><strong>나이 / 생년월일:</strong> 28세 (만 나이 기준) / 1998.01.23</li>
                    <li><strong>학력:</strong> 대구가톨릭대학교 컴퓨터공학과 (2025년 졸업)</li>
                    <li><strong>직무:</strong> 프론트엔드 개발자</li>
                    <li><strong>거주지:</strong> 대구광역시 북구 태전동</li>
                    <li><strong>관심 분야:</strong> 웹 개발, UX 디자인, 유튜브 콘텐츠 제작</li>
                </ul>
            </div>
            
          </div>

          <div className="skills-content">
            <h3>나의 기술 무기들</h3>
            <div className="skill-category">
              <h4>Languages</h4>
              <ul className="skill-list">
                <li>JavaScript (ES6+)</li>
                {/* <li>TypeScript</li> */}
                <li>HTML5</li>
                <li>CSS3 </li>
              </ul>
            </div>
            <div className="skill-category">
              <h4>Frontend (프론트엔드) & Backend & API</h4>
              <ul className="skill-list">
                <li>React (Hooks, Context API)</li>
                {/* <li>Next.js (SSG, SSR)</li> */}
                <li>Redux 툴킷(상태 관리)</li>
                <li>React Router</li>
                <li>Styled Components / Tailwind CSS</li>
                <li>Node.js</li>
                <li>Express (Node.js 프레임워크)</li>
                <li>Mysql</li>
              </ul>
            </div>
            <div className="skill-category">
              <h4>Tools & Others</h4>
              <ul className="skill-list">
                <li>Git / GitHub</li>
                <li>VS Code</li>
                <li>RESTful API</li>
              </ul>
            </div>
            {/* 더 많은 기술 스택 추가 (아이콘이나 프로그레스 바로 시각화하면 더 좋아요!) */}
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* 🚀 4. 프로젝트 경험 (Projects) 섹션 - 너의 실력을 증명할 시간! 🚀 */}
      {/* ============================================================= */}
      <section id="projects" className="section-projects">
        <div className="section-content">
          <h2 className="section-title">내 손으로 만든 프로젝트들</h2>
          <div className="projects-grid">
            {/* 프로젝트 1 */}
            <div className="project-card" onClick={() => handleProjectClick('project1')}>
              <img src={projectsData[0].thumbnail} alt={projectsData[0].name} className="project-thumbnail" />
              <h3 className="project-title">{projectsData[0].name}</h3>
              <p className="project-description">{projectsData[0].description}</p>
              <div className="project-tech-stack">
                {projectsData[0].techStack.map((tech, index) => <span key={index}>{tech}</span>)}
              </div>
              <div className="project-links">
                <a href={projectsData[0].github} target="_blank" rel="noopener noreferrer" className="btn-secondary" onClick={(e) => e.stopPropagation()}>GitHub</a>
                {/* <a href={projectsData[0].demo} target="_blank" rel="noopener noreferrer" className="btn-secondary" onClick={(e) => e.stopPropagation()}>Demo Link</a> */}
              </div>
            </div>

            {/* 프로젝트 2 */}
            <div className="project-card" onClick={() => handleProjectClick('project2')}>
              <img src={projectsData[1].thumbnail} alt={projectsData[1].name} className="project-thumbnail" />
              <h3 className="project-title">{projectsData[1].name}</h3>
              <p className="project-description">{projectsData[1].description}</p>
              <div className="project-tech-stack">
                {projectsData[1].techStack.map((tech, index) => <span key={index}>{tech}</span>)}
              </div>
                  <div className="project-links">
                {/* ✨ 이 부분을 수정합니다: project2의 URL 속성 사용 ✨ */}
                {projectsData[1].github && <a href={projectsData[1].github} target="_blank" rel="noopener noreferrer" className="btn-secondary" onClick={(e) => e.stopPropagation()}>GitHub</a>}
                {projectsData[1].demo && <a href={projectsData[1].demo} target="_blank" rel="noopener noreferrer" className="btn-secondary" onClick={(e) => e.stopPropagation()}>Demo Link</a>}
                {projectsData[1].Url && <a href={projectsData[1].Url} target="_blank" rel="noopener noreferrer" className="btn-secondary" onClick={(e) => e.stopPropagation()}>YouTube Channel</a>}
              </div>
            </div>

          </div>
        </div>
      </section>

      <section id="post-project-review" className="section-post-review">
        <div className="section-content">
          <h2 className="section-title">프로젝트를 만들고 난 후기</h2>
          <div className="review-content">
            <p>
              '알바툰' 프로젝트를 맨 처음 시작했을 때는 웹에 글자 하나 띄우는 것만으로도 신기하고 재미있었습니다. 그 재미가 제가 이분야로 들어오게 된 큰 계기입니다. 
              하지만 개발을 '업'으로 생각하고 실제 문제점들을 마주했을 때, 잠시 적성에 대한 고민과 함께 주춤했던 시기도 있었습니다. 
              하지만 <span class="review-growth-highlight">다양한 경험을 통해, 그저 하고 싶은 일만 좇는 것은 무책임한 행동임을 깨달았고, '책임감'의 중요성을 깊이 인식하게 되었습니다.</span>
              회사 생활이라는게 내가 하고싶은일만 한다면 너무나도 좋겠지만, 그렇지않는 순간이 훨신 많을 것입니다. 하지만 저는 책임감이 얼마나 중요한지 깨달았기에 그러한 상황에 쳐했을때 도망치지 않고 문제들을 해결해 나갈 수 있다고 장담합니다.
            </p>
            
            <p>
              그리고 이 프로젝트를 만들면서 마주한 많은 문제들 속에서, <span class="review-ai-highlight">AI의 도움은 문제 해결의 속도와 생산성을 비약적으로 높여주었습니다.</span> 하지만 그로인해 제가 모든 코드를 짜는게 아니기에 코드에 대한 이해도나 효율성이 떨어진다고 생각합니다. 허나 저는 현대 개발자에게는 <span class="review-strength-highlight">코드를 넘어선 '큰 그림을 그리는 능력'과 '실질적인 비즈니스 가치 창출 능력'</span>이 더욱 중요하다고 생각합니다. 
              코드의 효율이나 가독성을 높이는 기술적 측면에서는 부족할지 몰라도, '이 기능이 회사에 어떤 실질적인 도움이 될까?', '어떻게 하면 서비스의 생산성을 극대화할 수 있을까?'와 같은 비즈니스 관점의 고민을 깊이 해왔기에, 이런 부분에서 다른 개발자보다 차별화된 강점이 있다고 자부합니다.
            </p>
            
            <p>
              그리고 이 알바툰 프로젝트는 아직 미완성입니다. 저는 이 프로젝트를 처음부터 혼자 만들었고 그로 인해 저혼자서는 모든걸 해낼 수 없고, 다른 사람들의 도움이 얼마나 절실한지 깨달았습니다. 
              웹 개발이라는게 겉보기엔 단순해보이지만, 모든 것을 혼자 구현하기에는 턱없이 부족한것을 깨달았기에 <span class="review-collaboration-highlight">협업의 중요성</span>이 얼마나 큰지를 몸소 체험했습니다. 
              물론 실무에서의 협업은 익숙지 않아 초반에는 삐걱거릴 수도 있겠지만, 협업의 가치를 누구보다 잘 아는 저이기에 멈추지 않고 적극적으로 배우고 기여하며 성장할 것입니다.
            </p>
            
            <p>
              마지막으로 저는 <span class="review-innovation-highlight">끊임없이 배우고 늘 새로운 시도를 추구합니다.</span> 저의 유튜브 채널 활동은 이러한 저의 성향을 잘 보여줍니다. 짧은 쇼츠 영상들이지만 '어떻게 하면 최소한의 자원으로 최대의 생산성을 낼 수 있을까?'라는 고민 끝에 드라마 쇼츠에 최대한의 화질 업스케일링을 시도했습니다. 당시에는 흔치 않았던 시도로 최대 500~600만 조회수를 달성하기도 했죠. 비록 수익화로는 이어지지 않았지만, 새로운 시도와 그로 인한 반응을 분석하며 인사이트를 얻는 값진 경험이었습니다. 
              저는 현재 <span class="review-frontend-developer">프론트엔드 개발자</span>이지만, 단순히 기술에만 국한되지 않는 <span class="review-potential">무궁무진한 가능성을 가진 '윤여원'</span>이라는 사람을 소개하고 싶습니다! 감사합니다😊
            </p>
          </div>
        </div>
      </section>

            <section id="contact" className="section-contact">
        <div className="section-content">
          <h2 className="section-title">저와 함께 성장할 준비가 되셨나요?</h2>
          <p className="contact-description">궁금한 점이 있거나, 함께 일하고 싶으시다면 언제든지 편하게 연락 주세요!</p>
          <div className="contact-info">
            <p><strong>Email:</strong> <a>ghkfkddlqtl@naver.com</a></p>
            <p><strong>Tel:</strong><a>010-6522-7425</a></p>
          </div>
        </div>
      </section>

        

      {/* ============================================================= */}
      {/* 🦶 푸터 (Footer) - 웹사이트의 마지막 인사 🦶 */}
      {/* ============================================================= */}
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