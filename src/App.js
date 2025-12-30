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
                    {project.demo && <a href={project.demo} target="_blank" rel="noopener noreferrer" className="btn-modal-link">Demo</a>}
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
      github: 'https://github.com/your-github/project1',
      demo: 'https://project1-demo.netlify.app',
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
<br/><span class="highlight-num-1">첫째</span> 알바툰의 메인 기능인 출근부입니다, 이 기능은 하루마다 리셋이 되며 그 가게에 속해 있는 모든 유저가 사용가능하며 출근 버튼을 누르는 순간 저장이 되고 퇴근 버튼까지 누르면 다시 DB에 저장 되는 기능을 가지고 있습니다.
<br/><span class="highlight-num-2">두번째</span> 스케줄러입니다, 이 기능 또한 가게에 속한 모두가 사용할 수 있으며 원하는 날짜에 내용을 담고 저장을 누르면 모두가 열람 가능한 시스템입니다.
<br/><span class="highlight-num-3">세번째</span> 채팅방입니다, 이전까지는 다른 통합서버를 통해 DB에 저장하고 했지만 이 기능은 실시간 채팅 기능을 위해 socket.io를 사용하였고 별도로 다른 서버가 하나더 있습니다, 그로 인해 실시간 대화가 가능하도록 구현했습니다.
<br/><span class="highlight-num-4">네번째</span> 게시판 기능입니다, 이 기능은 전과 동일하게 모든 유저가 사용가능하며 공지해야하는 글이나 올릴 수 있는 기능입니다.
<br/><span class="highlight-num-5">마지막은</span> 근무일지 검색 기능입니다, 이 기능은 관리자 권한을 가진 사람만 열람가능하며 특정 날짜에 어떤 멤버가 얼마나 근무를 하였는지 체크 가능한 기능입니다.`}, 
        { type: 'image_text', image: 'project1_demo_screenshot.jpg', title: '6. 유저 접근 및 접근 통제' ,content: ' 유저들이 맨 처음 회원가입을 하는 과정, 그 후 가게를 만드는 과정입니다, 이러한 정보는 Mysql DB에 저장되어 관리하며 가게를 만든 관리자가 신규 유저를 가게에 추가등록 삭제할 수 있습니다,그리고 로그인이 되어있지 않은 상태에서 기능들에 접근하게 된다면 로그인을 할수 있게 통제하며 이 과정은 JWT토큰을 이용해 유저를 판별하여 권한 부여 접근 제어를 하고 있습니다.  .'}, // 9페이지 (이미지는 임시)
        { type: 'links', title: '프로젝트 정보', content: '더 자세한 내용은 GitHub과 데모 링크에서 확인하실 수 있습니다.' } // 10페이지
      ]
    },
    {
      id: 'project2',
      name: '프로젝트 2: 나만의 유튜브 채널',
      thumbnail: '/유튜브메인.png',
      description: '사용자 취향과 냉장고 재료를 기반으로 레시피를 추천해주는 서비스입니다.',
      fullDescription: '프로젝트 2는 요리에 대한 고민을 줄이고자 하는 사람들을 위한 맞춤형 레시피 추천 서비스입니다. 사용자가 보유한 식재료와 선호하는 음식 유형을 입력하면, AI 기반의 추천 알고리즘을 통해 최적의 레시피를 제안합니다. Next.js를 활용하여 SSR/SSG 환경에서 SEO 최적화 및 빠른 로딩 속도를 확보했으며, 상태 관리는 Zustand로 간결하게 구현했습니다. 디자인 시스템 구축 및 빠른 UI 개발을 위해 Tailwind CSS를 도입했고, Firebase를 이용하여 사용자 데이터와 레시피 정보를 안정적으로 저장 및 관리합니다. 또한 외부 요리 API를 연동하여 방대한 레시피 데이터를 활용했습니다. 이 프로젝트를 통해 사용자 인터페이스 설계, 백엔드 없는 서비스 개발(Serverless), 그리고 외부 API 연동 기술을 심도 있게 경험했습니다.',
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
            <a href="https://github.com/your-github" target="_blank" rel="noopener noreferrer">GitHub</a>
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
            
            <img src="about_me_personal_photo.jpg" alt="About Me" className="about-me-image" />
            
            <p>호기심이 많고 새로운 도전을 즐기는 저는 개발뿐만 아니라 다양한 분야에 관심이 많습니다. 특히 <span className="highlight">[프리미어 프로를 이용한 롤 영상 편집]</span>과 <span className="highlight">[가게 디자인 및 메인 페이지 꾸미기]</span>에 깊은 흥미를 느끼고 있습니다. 이러한 활동들을 통해 사용자 경험을 개선하고 시각적으로 매력적인 결과물을 만드는 즐거움을 느끼고 있습니다. 제 삶의 모든 경험이 결국 더 나은 코드를 작성하고 창의적인 해결책을 찾는 데 도움이 된다고 믿습니다.</p>
            <p>새로운 기술을 학습하고 적용하는 것을 좋아하며, 문제 해결 과정을 즐기는 개발자로서 끊임없이 성장하고 있습니다. 주변 사람들과의 소통과 협업을 중요하게 생각하며 긍정적인 에너지를 나누고자 노력합니다.</p>

            <div className="personal-info-list">
                <h4>기본 정보</h4>
                <ul>
                    <li><strong>이름:</strong> 윤여원</li>
                    <li><strong>나이:</strong> 28세 (만 나이 기준)</li>
                    <li><strong>학력:</strong> 대구과학대학교 컴퓨터소프트웨어학과</li>
                    <li><strong>직무:</strong> 디자인</li>
                    <li><strong>거주지:</strong> 부산광역시, 대구광역시 북구 태전동</li>
                    <li><strong>관심 분야:</strong> 웹 개발, UX 디자인, 게임 콘텐츠 제작</li>
                </ul>
            </div>
            
            <h3>나의 이야기</h3>
            <p>어릴 적부터 무언가를 만들고 문제를 해결하는 것에 큰 흥미를 느꼈습니다. 코딩을 통해 저의 아이디어가 실제 서비스로 구현되는 것을 보며 프론트엔드 개발의 매력에 푹 빠졌습니다. 특히 React를 활용한 컴포넌트 기반 개발과 사용자 인터페이스 개선에 관심을 가지고 있습니다.</p>
            <p>저는 팀원들과의 소통과 협업을 중요하게 생각하며, 새로운 기술을 빠르게 학습하고 적용하는 것을 즐깁니다. 변화하는 웹 환경 속에서 사용자들에게 최적의 경험을 제공하기 위해 항상 노력합니다.</p>
            {/* 더 많은 자기소개 내용 추가 */}
          </div>

          <div className="skills-content">
            <h3>나의 기술 무기들</h3>
            <div className="skill-category">
              <h4>Languages</h4>
              <ul className="skill-list">
                <li>JavaScript (ES6+)</li>
                <li>TypeScript</li>
                <li>HTML5</li>
                <li>CSS3 (Sass/SCSS)</li>
              </ul>
            </div>
            <div className="skill-category">
              <h4>Frameworks & Libraries</h4>
              <ul className="skill-list">
                <li>React (Hooks, Context API)</li>
                <li>Next.js (SSG, SSR)</li>
                <li>Redux / Zustand (상태 관리)</li>
                <li>React Router</li>
                <li>Styled Components / Tailwind CSS</li>
              </ul>
            </div>
            <div className="skill-category">
              <h4>Tools & Others</h4>
              <ul className="skill-list">
                <li>Git / GitHub</li>
                <li>VS Code</li>
                <li>Webpack / Vite</li>
                <li>RESTful API</li>
                <li>Figma (기본 사용)</li>
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
                <a href={projectsData[0].demo} target="_blank" rel="noopener noreferrer" className="btn-secondary" onClick={(e) => e.stopPropagation()}>Demo Link</a>
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

      {/* ============================================================= */}
      {/* 📧 5. 연락처 (Contact) 섹션 - 소통의 창구 📧 */}
      {/* ============================================================= */}
      <section id="contact" className="section-contact">
        <div className="section-content">
          <h2 className="section-title">저와 함께 성장할 준비가 되셨나요?</h2>
          <p className="contact-description">궁금한 점이 있거나, 함께 일하고 싶으시다면 언제든지 편하게 연락 주세요!</p>
          <div className="contact-info">
            <p><strong>Email:</strong> <a href="mailto:your.email@example.com">your.email@example.com</a></p>
            <p><strong>GitHub:</strong> <a href="https://github.com/your-github" target="_blank" rel="noopener noreferrer">github.com/your-github</a></p>
            <p><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/your-linkedin" target="_blank" rel="noopener noreferrer">linkedin.com/in/your-linkedin</a></p>
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