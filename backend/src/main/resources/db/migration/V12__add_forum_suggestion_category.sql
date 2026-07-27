ALTER TABLE forum_thread
    DROP CHECK chk_forum_thread_category;

ALTER TABLE forum_thread
    ADD CONSTRAINT chk_forum_thread_category
        CHECK (category IN ('ANNOUNCEMENT', 'DISCUSSION', 'FIND_MANGA', 'FEEDBACK', 'SUGGESTION'));
