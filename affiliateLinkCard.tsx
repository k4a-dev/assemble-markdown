import styles from './affiliateLinkCard.module.scss'

const Affiliate = ({ elem }: { elem: any }) => {
  const StoreInfo = ({ id, name }: { id: string; name: string }) => {
    return (
      <>
        {elem.links[id] ? (
          <a className={styles[id]} href={elem.links[id]} target="_blank" rel="noreferrer">
            {`${name}で購入`}
          </a>
        ) : null}
      </>
    )
  }

  return (
    <>
      <div className={styles.affiliate}>
        <div className="image__comtainer">
          <img src={elem.links.img} alt="" />
        </div>
        <div className={styles.textContainer}>
          <div className={styles.linkTitle}>{elem.links.title}</div>
          <div className={styles.affiliateBtnContainer}>
            <StoreInfo id="amazon" name="Amazon"></StoreInfo>
            <StoreInfo id="rakuten" name="楽天"></StoreInfo>
            <StoreInfo id="yahoo" name="Yahoo"></StoreInfo>
          </div>
        </div>
      </div>
    </>
  )
}

export default Affiliate
