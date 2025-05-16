export default class SaveStoryPage {
  async render() {
    return `
      <section class="content">
        <h1 class="content__heading">Story Collection</h1>
        <div id="bookmark-content" class="stories"></div>
      </section>
    `;
  }

  async afterRender() {}
}
