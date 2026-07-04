package com.mangablade.backend.services.otruyen;


import com.mangablade.backend.entities.Chapter;
import com.mangablade.backend.entities.Manga;
import com.mangablade.backend.integration.otruyen.OTruyenClient;
import com.mangablade.backend.integration.otruyen.response.OTruyenMangaResponse;
import com.mangablade.backend.mapper.ChapterMapper;
import com.mangablade.backend.mapper.MangaMapper;
import com.mangablade.backend.repositories.ChapterRepository;
import com.mangablade.backend.repositories.MangaRepository;
import com.mangablade.backend.services.mangablade.ChapterService;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OTruyenImportService {
    private final MangaRepository mangaRepository;
    private final MangaMapper mangaMapper;
    private final ChapterMapper chapterMapper ;
    private final ChapterRepository chapterRepository ;
    private final ChapterService chapterService;
    private final OTruyenClient oTruyenClient;

    @Scheduled(cron = "${spring.app.otruyen.import-cron}" , zone = "Asia/Ho_Chi_Minh")
    public void fetchMangaData(){
        // fetch api
        var response = oTruyenClient.fetchMangaBySlug("wind-breaker");
        var manga = importManga(response);
        importChapter(response, manga);
    }

    @Scheduled(cron = "${spring.app.otruyen.import-cron}" , zone = "Asia/Ho_Chi_Minh")
    public void fetchChapterPage(){

    }

    public Manga importManga(OTruyenMangaResponse response){
        // save manga
        var newManga =  mangaMapper.toEntity(response);
        var manga = mangaRepository.findByOtruyenMangaId(response.getData().getItem().getId()).orElse(newManga);
        return  mangaRepository.save(manga);
    }

    public void importChapter(OTruyenMangaResponse response , Manga manga){
        // get chapter list from Response
        var chapters = response.getData().getItem().getChapters();

        // only update chapter when there has been changed
        if(chapterService.getTotalChapters() != chapters.size()){
            chapters.forEach(data -> {
                data.getSeverData().forEach( chapterData -> {
                    var currentChapter = chapterMapper.toEntity(chapterData, manga);
                    chapterRepository.save(currentChapter);
                });
            });
        }

    }
}
