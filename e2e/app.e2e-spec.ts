import { ScaleTestPage } from './app.po';

describe('scale-test App', () => {
  let page: ScaleTestPage;

  beforeEach(() => {
    page = new ScaleTestPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
