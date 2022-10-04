import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ClipService } from '../services/clip.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-clips-list',
  templateUrl: './clips-list.component.html',
  styleUrls: ['./clips-list.component.css'],
  providers: [DatePipe]
})
export class ClipsListComponent implements OnInit, OnDestroy {
  // Disable infinite scrolling when the video is played (limit to just 6 videos)
  @Input() scrollable = true

  constructor(public clipService: ClipService) {
    this.clipService.getClips()
  }

  ngOnInit(): void {
    // Disable infinite scrolling when the video is played (limit to just 6 videos)
    if (this.scrollable) {
      window.addEventListener('scroll', this.handleScroll)
    }
  }

  ngOnDestroy() {
    // Disable infinite scrolling when the video is played (limit to just 6 videos)
    if (this.scrollable) {
      window.removeEventListener('scroll', this.handleScroll)
    }

    this.clipService.pageClips = []
  }

  handleScroll = () => {
    const { scrollTop, offsetHeight } = document.documentElement
    const { innerHeight } = window

    const bottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight

    if (bottomOfWindow) {
      this.clipService.getClips()
    }
  }

}
