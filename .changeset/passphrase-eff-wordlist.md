---
'@systemix/passphrase': minor
---

Replace the 10-word default list with the EFF large wordlist (7,776 words). The previous default gave a 4-word passphrase only ~13 bits of entropy; it now gives ~51.7 bits. Passphrases generated before this release with the default list are weak and should be regenerated.
