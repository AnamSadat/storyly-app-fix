export default class AboutPage {
  async render() {
    return `
      <section class="content">
        <h1 style="margin-bottom = 20px;">About Page</h1>
        <p>Storyly App adalah platform berbasis web yang memungkinkan pengguna untuk berbagi dan menjelajahi berbagai cerita menarik dari seluruh penjuru. Dengan tampilan yang sederhana dan responsif, Storyly memudahkan siapa saja untuk menulis, membaca, dan menyimpan cerita favorit mereka. Aplikasi ini dirancang untuk memberikan pengalaman membaca yang personal dan inspiratif, sekaligus membangun komunitas yang saling berbagi kisah hidup, petualangan, hingga pengalaman sehari-hari.</p>
      </section>
    `;
  }

  async afterRender() {}
}
