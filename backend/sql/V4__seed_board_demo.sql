-- 공개 게시판 데모 Q&A (10건) — 일반 회원 작성자, API에서 이름 가운데 마스킹
-- 실행: deploy/vps/seed-board-demo.sh

-- 기존 운영팀 데모 글 작성자 갱신
UPDATE site_board_posts SET author_name = '김지영', updated_at = NOW()
WHERE author_name = 'BizGrant 운영팀' AND title = '회원가입 없이도 정부지원금 공고를 볼 수 있나요?';
UPDATE site_board_posts SET author_name = '이준호', updated_at = NOW()
WHERE author_name = 'BizGrant 운영팀' AND title = '대시보드의 적합도(%)는 어떤 기준으로 나오나요?';
UPDATE site_board_posts SET author_name = '박서연', updated_at = NOW()
WHERE author_name = 'BizGrant 운영팀' AND title = '마감이 얼마 안 남은 공고만 모아서 볼 수 있나요?';
UPDATE site_board_posts SET author_name = '최민재', updated_at = NOW()
WHERE author_name = 'BizGrant 운영팀' AND title = '북마크한 공고는 어디서 다시 보나요?';
UPDATE site_board_posts SET author_name = '정하은', updated_at = NOW()
WHERE author_name = 'BizGrant 운영팀' AND title = '나라장터 입찰 공고도 지원금 공고랑 같이 보나요?';
UPDATE site_board_posts SET author_name = '강동욱', updated_at = NOW()
WHERE author_name = 'BizGrant 운영팀' AND title = '서류 체크리스트는 직접 추가·수정할 수 있나요?';
UPDATE site_board_posts SET author_name = '윤채원', updated_at = NOW()
WHERE author_name = 'BizGrant 운영팀' AND title = '뉴스레터는 비회원도 구독할 수 있나요?';
UPDATE site_board_posts SET author_name = '임태훈', updated_at = NOW()
WHERE author_name = 'BizGrant 운영팀' AND title = '무료 플랜과 유료 플랜의 차이가 궁금합니다.';
UPDATE site_board_posts SET author_name = '한소희', updated_at = NOW()
WHERE author_name = 'BizGrant 운영팀' AND title = '공고 데이터는 얼마나 자주 갱신되나요?';
UPDATE site_board_posts SET author_name = '오지훈', updated_at = NOW()
WHERE author_name = 'BizGrant 운영팀' AND title = '지점이 여러 곳인데, 맞춤 추천은 어떤 주소 기준인가요?';

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM site_board_posts
        WHERE title = '회원가입 없이도 정부지원금 공고를 볼 수 있나요?'
    ) THEN
        RAISE NOTICE '데모 게시글이 이미 있습니다. 작성자만 갱신했습니다.';
        RETURN;
    END IF;

    INSERT INTO site_board_posts (title, content, author_id, author_name, pinned, view_count, published, created_at, updated_at) VALUES
    (
        '회원가입 없이도 정부지원금 공고를 볼 수 있나요?',
        '처음 사이트에 들어왔는데, 가입 전에도 공고 목록을 볼 수 있는지 궁금합니다. 어디까지 무료로 이용 가능한가요?',
        NULL, '김지영', TRUE, 128, TRUE, NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'
    ),
    (
        '대시보드의 적합도(%)는 어떤 기준으로 나오나요?',
        '맞춤 추천에 적합도 퍼센트가 나오는데, 어떤 항목을 비교해서 점수가 나오는 건지 설명 부탁드립니다.',
        NULL, '이준호', FALSE, 94, TRUE, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'
    ),
    (
        '마감이 얼마 안 남은 공고만 모아서 볼 수 있나요?',
        '매일 들어오기 어려운데, 마감 임박한 공고만 따로 모아보는 기능이 있을까요?',
        NULL, '박서연', FALSE, 76, TRUE, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'
    ),
    (
        '북마크한 공고는 어디서 다시 보나요?',
        '관심 공고에 북마크를 눌렀는데, 나중에 다시 찾는 메뉴 위치를 모르겠습니다.',
        NULL, '최민재', FALSE, 61, TRUE, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'
    ),
    (
        '나라장터 입찰 공고도 지원금 공고랑 같이 보나요?',
        '보조금 사업만 찾다가 나라장터 입찰도 있는 것 같아서, 두 종류를 어떻게 구분해서 보면 되는지 질문드립니다.',
        NULL, '정하은', FALSE, 88, TRUE, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
    ),
    (
        '서류 체크리스트는 직접 추가·수정할 수 있나요?',
        '공고마다 필요 서류가 다른데, 체크리스트에 우리 회사만의 항목을 추가할 수 있는지 궁금합니다.',
        NULL, '강동욱', FALSE, 52, TRUE, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'
    ),
    (
        '뉴스레터는 비회원도 구독할 수 있나요?',
        '메일로 주간 요약을 받고 싶은데, 회원가입 없이도 구독 가능한지 알려주세요.',
        NULL, '윤채원', FALSE, 45, TRUE, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
    ),
    (
        '무료 플랜과 유료 플랜의 차이가 궁금합니다.',
        '무료로 쓰다가 유료로 바꿀지 고민 중입니다. 실제로 체감되는 차이가 무엇인지 경험 있으신 분 답변 부탁드려요.',
        NULL, '임태훈', FALSE, 103, TRUE, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
    ),
    (
        '공고 데이터는 얼마나 자주 갱신되나요?',
        '어제 본 공고가 오늘은 안 보여서, 수집·갱신 주기가 어떻게 되는지 궁금합니다.',
        NULL, '한소희', FALSE, 67, TRUE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
    ),
    (
        '지점이 여러 곳인데, 맞춤 추천은 어떤 주소 기준인가요?',
        '본사는 부천, 공장은 충남인데 추천 공고가 어느 지역 기준으로 잡히는지 알고 싶습니다.',
        NULL, '오지훈', FALSE, 39, TRUE, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'
    );

    RAISE NOTICE '공개 게시판 데모 Q&A 10건을 등록했습니다.';
END $$;

-- 데모 글 답변 댓글 (없을 때만)
DO $$
DECLARE
    pid BIGINT;
BEGIN
    SELECT id INTO pid FROM site_board_posts WHERE title = '회원가입 없이도 정부지원금 공고를 볼 수 있나요?' LIMIT 1;
    IF pid IS NULL THEN RETURN; END IF;
    IF EXISTS (SELECT 1 FROM site_board_comments WHERE post_id = pid) THEN RETURN; END IF;

    INSERT INTO site_board_comments (post_id, parent_id, author_id, author_name, content, created_at, updated_at) VALUES
    (pid, NULL, NULL, '박민수', '로그인 없이도 캘린더·공개 게시판 등은 볼 수 있어요. 북마크·맞춤 추천은 회원가입 후에 가능합니다.', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days');

    SELECT id INTO pid FROM site_board_posts WHERE title = '대시보드의 적합도(%)는 어떤 기준으로 나오나요?' LIMIT 1;
    INSERT INTO site_board_comments (post_id, parent_id, author_id, author_name, content, created_at, updated_at) VALUES
    (pid, NULL, NULL, '송예린', '공고 원문의 지원대상·업종·지역과 마이페이지 프로필을 맞춰보는 참고 점수예요. AI 자동 심사 점수는 아닙니다.', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days');

    SELECT id INTO pid FROM site_board_posts WHERE title = '마감이 얼마 안 남은 공고만 모아서 볼 수 있나요?' LIMIT 1;
    INSERT INTO site_board_comments (post_id, parent_id, author_id, author_name, content, created_at, updated_at) VALUES
    (pid, NULL, NULL, '장현우', '대시보드에 마감 임박 섹션이 있고, 캘린더에서도 날짜별로 확인할 수 있습니다.', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days');

    SELECT id INTO pid FROM site_board_posts WHERE title = '북마크한 공고는 어디서 다시 보나요?' LIMIT 1;
    INSERT INTO site_board_comments (post_id, parent_id, author_id, author_name, content, created_at, updated_at) VALUES
    (pid, NULL, NULL, '노다은', '상단 메뉴 「북마크」에서 모아볼 수 있어요. 공고 카드에서 별 아이콘 누르면 저장됩니다.', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

    SELECT id INTO pid FROM site_board_posts WHERE title = '나라장터 입찰 공고도 지원금 공고랑 같이 보나요?' LIMIT 1;
    INSERT INTO site_board_comments (post_id, parent_id, author_id, author_name, content, created_at, updated_at) VALUES
    (pid, NULL, NULL, '배성훈', '「정부지원금사업」과 「나라장터」 메뉴가 나뉘어 있어요. 입찰은 나라장터 탭에서 보시면 됩니다.', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days');

    SELECT id INTO pid FROM site_board_posts WHERE title = '서류 체크리스트는 직접 추가·수정할 수 있나요?' LIMIT 1;
    INSERT INTO site_board_comments (post_id, parent_id, author_id, author_name, content, created_at, updated_at) VALUES
    (pid, NULL, NULL, '류지안', '체크리스트 항목 추가·완료 체크 가능하고, 서류센터에서 Word 초안도 만들 수 있습니다.', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

    SELECT id INTO pid FROM site_board_posts WHERE title = '뉴스레터는 비회원도 구독할 수 있나요?' LIMIT 1;
    INSERT INTO site_board_comments (post_id, parent_id, author_id, author_name, content, created_at, updated_at) VALUES
    (pid, NULL, NULL, '문채원', '뉴스레터는 회원 전용이에요. 가입 후 푸터에서 구독할 수 있습니다.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

    SELECT id INTO pid FROM site_board_posts WHERE title = '무료 플랜과 유료 플랜의 차이가 궁금합니다.' LIMIT 1;
    INSERT INTO site_board_comments (post_id, parent_id, author_id, author_name, content, created_at, updated_at) VALUES
    (pid, NULL, NULL, '서도윤', '무료도 검색·북마크·기본 적합도는 됩니다. 유료는 알림·서류 초안 등이 늘어나요. 요금제 페이지 참고하세요.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

    SELECT id INTO pid FROM site_board_posts WHERE title = '공고 데이터는 얼마나 자주 갱신되나요?' LIMIT 1;
    INSERT INTO site_board_comments (post_id, parent_id, author_id, author_name, content, created_at, updated_at) VALUES
    (pid, NULL, NULL, '권태영', '보통 하루에 한 번 이상 수집하는 편이고, 공고 상세에 출처·수집 정보가 나옵니다. 신청 전엔 원문 다시 확인하세요.', NOW() - INTERVAL '20 hours', NOW() - INTERVAL '20 hours');

    SELECT id INTO pid FROM site_board_posts WHERE title = '지점이 여러 곳인데, 맞춤 추천은 어떤 주소 기준인가요?' LIMIT 1;
    INSERT INTO site_board_comments (post_id, parent_id, author_id, author_name, content, created_at, updated_at) VALUES
    (pid, NULL, NULL, '황서준', '마이페이지에 등록한 사업장·지역 정보 기준입니다. 지점이 바뀌면 프로필 먼저 수정하는 게 좋아요.', NOW() - INTERVAL '10 hours', NOW() - INTERVAL '10 hours');

    RAISE NOTICE '데모 답변 댓글을 등록했습니다.';
END $$;
