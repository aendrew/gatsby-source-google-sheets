// gatsby-node.js
import GoogleSpreadsheet from "google-spreadsheet";
import createNodeHelpers from "gatsby-node-helpers";

const {
  createNodeFactory,
} = createNodeHelpers({
  typePrefix: `GoogleSheet`
});


exports.sourceNodes = async ({ boundActionCreators }, pluginOptions) => {
  const { createNode } = boundActionCreators;

  const rootName = pluginOptions.rootName || "Sheet";

  const RootNode = createNodeFactory(rootName);

  const doc = new GoogleSpreadsheet(pluginOptions.spreadsheetKey);

  if (pluginOptions.creds) {
    await new Promise(resolve =>
      doc.useServiceAccountAuth(pluginOptions.creds, resolve)
    );
  }

  const worksheets = await new Promise((resolve, reject) =>
    doc.getInfo((err, info) => {
      if (err || !info.worksheets.length) reject(err);
      resolve(info.worksheets);
    })
  );

  const items = await worksheets.reduce(async (acc, sheet) => {
    const rows = await new Promise((resolve, reject) => {
      sheet.getRows((err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    return (await acc).concat(rows);
  }, Promise.resolve([]));

  const rows = items.forEach(item => {
    const itemNode = RootNode(item);
    createNode(itemNode);
  });
};
