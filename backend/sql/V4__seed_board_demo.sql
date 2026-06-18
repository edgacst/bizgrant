-- 공개 게시판 데모 Q&A (10건)
-- 실행: deploy/vps/seed-board-demo.sh
-- 재실행해도 중복 삽입되지 않습니다 (author_name = 'BizGrant 운영팀' 기준).

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM site_board_posts WHERE author_name = 'BizGrant 운영팀' LIMIT 1) THEN
        RAISE NOTICE '데모 게시글이 이미 있습니다. 건너뜁니다.';
        RETURN;
    END IF;

    INSERT INTO site_board_posts (title, content, author_id, author_name, pinned, view_count, published, created_at, updated_at) VALUES
    (
        '회원가입 없이도 정부지원금 공고를 볼 수 있나요?',
        '네. 로그인하지 않아도 랜딩·캘린더·공개 게시판 등 일부 화면은 이용할 수 있습니다.

다만 맞춤 추천, 북마크, 파이프라인, 서류센터, 알림 설정 등은 회원 전용입니다. 무료 회원가입 후 대시보드에서 우리 회사에 맞는 공고를 한곳에서 관리해 보세요.',
        NULL,
        'BizGrant 운영팀',
        TRUE,
        128,
        TRUE,
        NOW() - INTERVAL '9 days',
        NOW() - INTERVAL '9 days'
    ),
    (
        '대시보드의 적합도(%)는 어떤 기준으로 나오나요?',
        'BizGrant 적합도는 AI가 자동 채점하는 방식이 아니라, 공고에 적힌 지원 대상·업종·지역·예산·마감일 등 공개 정보와 회원님이 입력한 기업 프로필을 규칙으로 비교해 산출하는 참고용 점수입니다.

100%라고 해서 반드시 선정되는 것은 아니며, 최종 자격 요건은 반드시 원문 공고와 주관기관 안내를 확인해 주세요.',
        NULL,
        'BizGrant 운영팀',
        FALSE,
        94,
        TRUE,
        NOW() - INTERVAL '8 days',
        NOW() - INTERVAL '8 days'
    ),
    (
        '마감이 얼마 안 남은 공고만 모아서 볼 수 있나요?',
        '가능합니다. 상단 메뉴의 「대시보드」에서 마감 임박 공고를 확인할 수 있고, 「캘린더」에서는 월별 마감 일정을 볼 수 있습니다.

「정부지원금사업」 목록에서는 마감일·카테고리·키워드로 필터링할 수 있으니, 급한 건부터 차례로 검토해 보시면 됩니다.',
        NULL,
        'BizGrant 운영팀',
        FALSE,
        76,
        TRUE,
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '7 days'
    ),
    (
        '북마크한 공고는 어디서 다시 보나요?',
        '로그인 후 상단 「북마크」 메뉴(또는 계정 메뉴 → 북마크)에서 저장한 공고를 모아볼 수 있습니다.

공고 카드의 별·북마크 버튼을 누르면 저장되며, 마감이 지난 공고는 목록에서 자동으로 정리될 수 있으니 수시로 확인해 주세요.',
        NULL,
        'BizGrant 운영팀',
        FALSE,
        61,
        TRUE,
        NOW() - INTERVAL '6 days',
        NOW() - INTERVAL '6 days'
    ),
    (
        '나라장터 입찰 공고도 지원금 공고랑 같이 보나요?',
        'BizGrant는 정부지원금·지원사업(기업마당 등)과 나라장터 입찰·낙찰 정보를 함께 수집해 보여 줍니다.

메뉴에서 「정부지원금사업」과 「나라장터」가 분리되어 있으니, 보조금·R&D 사업은 전자, 물품·용역 입찰은 나라장터 탭에서 찾아보시면 됩니다.',
        NULL,
        'BizGrant 운영팀',
        FALSE,
        88,
        TRUE,
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '5 days'
    ),
    (
        '서류 체크리스트는 직접 추가·수정할 수 있나요?',
        '네. 공고 상세의 체크리스트를 기본으로 제공하며, 회원은 항목을 추가·완료 체크·메모할 수 있습니다.

「서류센터」에서는 Word 초안 생성·보관함 기능으로 제출 서류 준비를 돕습니다. 실제 제출 양식은 주관기관 최신 공고문을 기준으로 해 주세요.',
        NULL,
        'BizGrant 운영팀',
        FALSE,
        52,
        TRUE,
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '4 days'
    ),
    (
        '뉴스레터는 비회원도 구독할 수 있나요?',
        '아니요. 주간 정부지원금 요약 뉴스레터는 회원 전용입니다. 가입 시 등록한 이메일로 발송되며, 푸터의 뉴스레터 영역에서 구독·해지할 수 있습니다.

비회원은 사이트 내 공고 탐색과 공개 게시판 열람은 가능합니다.',
        NULL,
        'BizGrant 운영팀',
        FALSE,
        45,
        TRUE,
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    ),
    (
        '무료 플랜과 유료 플랜의 차이가 궁금합니다.',
        '무료 플랜에서도 공고 검색·기본 적합도·북마크·캘린더 등 핵심 기능을 이용할 수 있습니다. 유료 플랜은 알림 건수, AI 서류 초안, 파이프라인 고급 기능 등이 확장됩니다.

정확한 제공 범위와 가격은 「요금제」 페이지를 참고해 주세요. 과장된 혜택 없이 현재 제공 기능만 안내하고 있습니다.',
        NULL,
        'BizGrant 운영팀',
        FALSE,
        103,
        TRUE,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        '공고 데이터는 얼마나 자주 갱신되나요?',
        '기업마당 API·나라장터 등 공개 소스를 환경 설정에 따라 정기적으로 수집합니다(보통 일 1회 이상). 수집 시각과 출처는 공고 상세에서 확인할 수 있습니다.

마감·내용 변경은 주관기관 공지가 최종이므로, 신청 직전에는 반드시 원문 링크를 다시 확인해 주세요.',
        NULL,
        'BizGrant 운영팀',
        FALSE,
        67,
        TRUE,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    ),
    (
        '지점이 여러 곳인데, 맞춤 추천은 어떤 주소 기준인가요?',
        '마이페이지에 등록한 본사·사업장 정보(지역, 업종, 규모)를 기준으로 적합도와 추천을 계산합니다.

지역 한정 공고는 사업장 소재지가 요건에 맞는지 공고 원문의 지원 대상을 꼭 확인하시고, 정보가 바뀌면 마이페이지를 먼저 수정해 주세요.',
        NULL,
        'BizGrant 운영팀',
        FALSE,
        39,
        TRUE,
        NOW() - INTERVAL '12 hours',
        NOW() - INTERVAL '12 hours'
    );

    RAISE NOTICE '공개 게시판 데모 Q&A 10건을 등록했습니다.';
END $$;
