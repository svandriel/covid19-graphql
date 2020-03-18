console.log('hi!');

main().catch(err => {
    console.error(err);
    process.exit(1);
});

async function main(): Promise<void> {
    // const x = await fetchConfirmed();
    // console.log(x.slice(0, 3));
}
