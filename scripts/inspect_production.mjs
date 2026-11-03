async function inspect() {
  try {
    const res = await fetch('https://wordbuddy-dusky.vercel.app');
    const html = await res.text();
    console.log('HTML fetched, length:', html.length);
    const match = html.match(/\/assets\/index-[a-zA-Z0-9_-]+\.js/);
    if (!match) {
      console.log('No index js found in HTML:', html.substring(0, 400));
      return;
    }
    const jsUrl = 'https://wordbuddy-dusky.vercel.app' + match[0];
    console.log('Bundle URL:', jsUrl);
    const jsRes = await fetch(jsUrl);
    const jsText = await jsRes.text();
    console.log('JS Bundle fetched, size:', jsText.length);

    const supabaseUrls = jsText.match(/https:\/\/[a-z0-9]+\.supabase\.co[^\s"']*/g);
    console.log('Supabase URLs in production bundle:', [...new Set(supabaseUrls || [])]);

    const lineDomains = jsText.match(/line\.me|wordbuddy\.line|wordbuddy\.app/g);
    console.log('Email domains in production bundle:', [...new Set(lineDomains || [])]);

    // Check if the latest commit hash or date is there
    const hasLatestLineAuth = jsText.includes('LINE_WB_');
    console.log('Contains LINE_WB_ deterministic password logic?:', hasLatestLineAuth);

    const hasLineMeDomain = jsText.includes('@line.me');
    console.log('Contains @line.me domain?:', hasLineMeDomain);

    const hasWordbuddyLine = jsText.includes('@wordbuddy.line');
    console.log('Contains OLD @wordbuddy.line?:', hasWordbuddyLine);
  } catch (err) {
    console.error('Error inspecting production:', err.message);
  }
}

inspect();

