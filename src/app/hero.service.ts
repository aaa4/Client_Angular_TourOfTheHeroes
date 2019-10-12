import {Injectable} from '@angular/core';
import {Hero} from './hero';
import {Observable, of} from 'rxjs';
import {MessageService} from './message.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HeroService {

  private heroUrl: string;

  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };

  constructor(
    private messageService: MessageService,
    private http: HttpClient) {
    this.heroUrl = 'http://localhost:8080/heroes/';
  }

  getHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.heroUrl)
      .pipe(
        tap(event => this.logWithMessageService('fetched heroes')),
        catchError(this.handleError<Hero[]>('getHeroes'))
      );
  }

  getHero(id: string): Observable<Hero> {
    const url = `${this.heroUrl}${id}`;
    return this.http.get<Hero>(url).pipe(
      tap(element => this.logWithMessageService(`fetched hero id =${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }

  updateHero(hero: Hero): Observable<any> {
    const url = `${this.heroUrl}${hero.id}`;
    return this.http.put(url, hero)
      .pipe(
        tap(_ => this.logWithMessageService(`updated hero id = ${hero.id}`)),
        catchError(this.handleError<any>('updateHero'))
      );
  }

  deleteHero(hero: Hero | string): Observable<Hero> {
    const id = typeof hero === 'string' ? hero : hero.id;
    const url = `${this.heroUrl}/${id}`;
    return this.http.delete<Hero>(url, this.httpOptions).pipe(
      tap(_ => this.logWithMessageService(`deleted hero id = ${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }

  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      return of([]);
    }
    return this.http.get<Hero[]>(`${this.heroUrl}/search?name=${term}`).pipe(
      tap(_ => this.logWithMessageService(`found heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);

      this.logWithMessageService(`${operation} failed: ${error.message}`);

      return of(result as T);
    };
  }

  private logWithMessageService(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }
}
