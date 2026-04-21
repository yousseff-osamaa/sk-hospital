import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section id="hospitalNews" class="section-padding container">
      
      <div *ngIf="!selectedPost">
        <div class="news-grid">
          <div *ngFor="let post of newsArticles.slice(0, displayCount)" (click)="viewPost(post)" class="news-card">
            <div class="card-img" [style.backgroundImage]="'url(' + post.image + ')'"></div>
            
            <div class="card-body">
              <div class="card-meta">
                <span class="category-tag">{{ post.category }}</span>
                <span class="post-date">{{ post.date }}</span>
              </div>
              
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-summary">{{ post.summary }}</p>
              
              <a href="javascript:void(0)" class="read-more">
                Read Full Article <span>→</span>
              </a>
            </div>
          </div>
        </div>

        <div class="text-center mt-5" *ngIf="displayCount < newsArticles.length">
          <button class="btn-see-more" (click)="showAllNews()">
            See More News
          </button>
        </div>
      </div>

      <div *ngIf="selectedPost" class="fade-in detail-view">
        <button (click)="selectedPost = null" class="back-btn">
            ← Back to News
        </button>
        
        <div class="detail-meta">
            <span class="category-tag">{{ selectedPost.category }}</span>
            <span class="detail-date">{{ selectedPost.date }}</span>
        </div>
        
        <h1 class="detail-title">{{ selectedPost.title }}</h1>
        <img [src]="selectedPost.image" class="detail-img">
        
        <!-- Multi-image Gallery in News Detail -->
        <div class="gallery-grid" *ngIf="selectedPost.images && selectedPost.images.length > 1">
            <div *ngFor="let img of selectedPost.images" 
                 class="thumb-item" 
                 [class.active]="selectedPost.image === img"
                 (click)="selectedPost.image = img">
                <img [src]="img">
            </div>
        </div>
        
        <div class="detail-content">
            <p>{{ selectedPost.content || selectedPost.summary }}</p>
            <p *ngIf="!selectedPost.content">
                We are proud to announce the latest updates regarding our commitment to healthcare excellence. 
                Our facilities continue to expand to accommodate the growing needs of our patient community. 
                This milestone represents a significant step forward in our mission, providing state-of-the-art 
                medical solutions and comprehensive care under one roof.
            </p>
        </div>
      </div>

    </section>
  `,
  styles: [`
    .btn-see-more {
      background: #00a76f;
      color: white;
      border: none;
      padding: 15px 40px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: 0.3s;
      margin: 40px auto;
      display: block;
      box-shadow: 0 10px 20px rgba(0, 167, 111, 0.2);
    }
    .btn-see-more:hover {
      background: #008f5d;
      transform: translateY(-3px);
      box-shadow: 0 15px 25px rgba(0, 167, 111, 0.3);
    }
    .text-center { text-align: center; }
    .mt-5 { margin-top: 3rem; }
    .news-grid {
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
        gap: 2.5rem;
        margin-top: 3rem;
    }
    .news-card {
        background: white; border-radius: 20px; overflow: hidden; 
        box-shadow: 0 10px 30px rgba(0,0,0,0.05); 
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        cursor: pointer;
    }
    .news-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
    .card-img { height: 230px; background-size: cover; background-position: center; }
    .card-body { padding: 1.8rem; }
    .card-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; }
    .category-tag { background: rgba(0, 167, 111, 0.1); color: #00a76f; padding: 5px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
    .post-title { color: #1c306e; margin-bottom: 0.8rem; font-size: 1.25rem; line-height: 1.4; font-weight: 700; }
    .post-summary { color: #637381; font-size: 0.95rem; line-height: 1.6; }
    .read-more { color: #00a76f; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 8px; margin-top: 1.5rem; }
    .detail-view { max-width: 900px; margin: 0 auto; background: white; padding: 4rem; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.05); }
    .back-btn { background: none; border: none; color: #1c306e; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; margin-bottom: 2.5rem; font-size: 1rem; }
    .detail-img { width: 100%; border-radius: 20px; margin: 2.5rem 0; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .detail-title { color: #1c306e; font-size: 2.6rem; line-height: 1.2; font-weight: 800; }
    .detail-content { color: #454f5b; font-size: 1.2rem; line-height: 1.9; white-space: pre-wrap; }
    .detail-date { color: #919eab; font-size: 1rem; margin-left: 1rem; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .section-padding { padding: 80px 0; }
    .gallery-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 15px;
        margin: 20px 0;
    }
    .thumb-item {
        height: 80px;
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        border: 3px solid transparent;
        transition: 0.2s;
    }
    .thumb-item:hover { transform: scale(1.05); }
    .thumb-item.active { border-color: #00a76f; }
    .thumb-item img { width: 100%; height: 100%; object-fit: cover; }
  `]
})
export class NewsComponent implements OnInit, OnDestroy {

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) {}

  selectedPost: any = null;
  currentHeroIndex = 0;
  slideInterval: any;
  displayCount = 2;

  heroImages: string[] = [
    '/minister-visit.png',
    '/uva-device.png',
    '/dr-zileli-visit.png'
  ];

  newsArticles: any[] = [];

ngOnInit() {
    // Start with localStorage news immediately
    const stored: any[] = JSON.parse(localStorage.getItem('newsArticles') || '[]');
    this.newsArticles = stored;
    this.cd.detectChanges();

    // Then fetch from DB and merge (DB news + localStorage news combined)
    this.http.get<any[]>(`${environment.apiUrl}/news/`).subscribe({
        next: (dbNews) => {
            // Transform API news to ensure image URLs are absolute if provided
            const transformedDbNews = dbNews.map((n: any) => ({
                ...n,
                image: n.image_url || n.image || '',
                images: n.images || []
            }));

            // Merge: DB news first, then localStorage-only news after
            const dbTitles = new Set(transformedDbNews.map((n: any) => n.title?.toLowerCase()));
            const localOnly = stored.filter((n: any) =>
                !dbTitles.has(n.title?.toLowerCase())
            );
            this.newsArticles = [...transformedDbNews, ...localOnly];
            this.cd.detectChanges();
        },
        error: () => {
            // DB failed — just use localStorage news, already set above
            this.cd.detectChanges();
        }
    });

    this.startTimer();
}

  ngOnDestroy() {
    this.stopTimer();
  }

  showAllNews() {
    this.displayCount = this.newsArticles.length;
  }

  startTimer() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopTimer() {
    if (this.slideInterval) clearInterval(this.slideInterval);
  }

  nextSlide() {
    this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroImages.length;
  }

  prevSlide() {
    this.currentHeroIndex = (this.currentHeroIndex - 1 + this.heroImages.length) % this.heroImages.length;
  }

  goToSlide(index: number) {
    this.currentHeroIndex = index;
    this.resetTimer();
  }

  resetTimer() {
    this.stopTimer();
    this.startTimer();
  }

  viewPost(post: any) {
    this.selectedPost = post;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}