using UnityEngine;
using System.Collections;

public class FallingPlatform : MonoBehaviour
{


    [SerializeField] private float fallDelay = 1f;
    [SerializeField] private float destroyDelay = 2f;

    private bool falling = false;
    [SerializeField] private Rigidbody2D rb;

    private void OnCollisionEnter2D(Collision2D collision)
    {
        if (falling)
         return;

        if (collision.transform.tag == "Player")
        {
            StartCoroutine(StartFall());
        }
    }

    private IEnumerator StartFall()
    {
        falling = true;

        yield return new WaitForSeconds(fallDelay);

       rb.bodyType = RigidbodyType2D.Dynamic;
        Destroy(gameObject, destroyDelay);
    }
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
